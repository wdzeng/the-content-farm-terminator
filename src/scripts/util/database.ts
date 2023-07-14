import { intersectArray, removeDuplicates, subtractArray } from './array.js'

const storage = (typeof browser === 'undefined' ? chrome : browser).storage
const KEY_FARM_LIST_SIZE = 'farmListSize'
const MAX_LIST_SIZE = 400

function getFarmListPageKeyAt(page: number): string {
  const KEY_FARM_LIST = 'farmList'
  return `${KEY_FARM_LIST}${page}`
}

/**
 * Queries all hosts in the database.
 * @returns hosts in the database.
 */
export async function getFarmList(): Promise<string[]> {
  // Query segment count.
  const segmentCountQuery: Record<string, number> = {}
  segmentCountQuery[KEY_FARM_LIST_SIZE] = 0
  const res1: Record<string, number> = await storage.sync.get(segmentCountQuery)
  const segmentCount: number = res1[KEY_FARM_LIST_SIZE] ?? 0

  if (segmentCount === 0) {
    return []
  }

  // Query segments and merge into one.
  const segmentKeysQuery: string[] = []
  for (let i = 0; i < segmentCount; i++) {
    segmentKeysQuery.push(getFarmListPageKeyAt(i))
  }
  const segmentListResponse: Record<string, string[]> = await storage.sync.get(segmentKeysQuery)
  return Object.values(segmentListResponse).flat()
}

/**
 * Inserts hosts into database.
 * @returns inserted hosts.
 */
export async function addHosts(hosts: string[]): Promise<string[]> {
  hosts = removeDuplicates(hosts)

  if (hosts.length === 0) {
    // No new hosts are added so do nothing.
    return []
  }

  // Compute new list.
  const oldList = await getFarmList()
  const newList = removeDuplicates([...oldList, ...hosts])

  if (oldList.length === newList.length) {
    // No new hosts are added so do nothing.
    return []
  }

  // Break list into sections.
  let startIndex = Math.ceil(oldList.length / MAX_LIST_SIZE) - 1
  startIndex = Math.max(startIndex, 0)
  const endIndex = Math.ceil(newList.length / MAX_LIST_SIZE)
  const body: Record<string, string[] | number> = {}
  for (let i = startIndex; i < endIndex; i++) {
    const index = i * MAX_LIST_SIZE
    body[getFarmListPageKeyAt(i)] = newList.slice(index, index + MAX_LIST_SIZE)
  }
  body[KEY_FARM_LIST_SIZE] = endIndex

  await storage.sync.set(body)
  return subtractArray(newList, oldList)
}

/**
 * Removes hosts from database.
 * @returns removed hosts.
 */
export async function removeHosts(hosts: string[]): Promise<string[]> {
  hosts = removeDuplicates(hosts)
  if (hosts.length === 0) {
    // No hosts are removed so do nothing.
    return []
  }

  // Generate the new list.
  const list = await getFarmList()
  const newList = subtractArray(list, hosts)
  if (newList.length === list.length) {
    // No hosts are removed so do nothing.
    return []
  }

  // Update the entire database.
  const body: Record<string, string[] | number> = {}
  const segmentCount = Math.ceil(newList.length / MAX_LIST_SIZE)
  for (let i = 0; i < segmentCount; i++) {
    const index = i * MAX_LIST_SIZE
    body[getFarmListPageKeyAt(i)] = newList.slice(index, index + MAX_LIST_SIZE)
  }
  body[KEY_FARM_LIST_SIZE] = segmentCount
  await storage.sync.set(body)

  return intersectArray(list, hosts)
}
