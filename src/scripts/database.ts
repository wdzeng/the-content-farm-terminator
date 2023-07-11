import { intersectArray, removeDuplicates, subtractArray } from './util.js'

const KEY_FARM_LIST = 'farmList'
const KEY_FARM_LIST_SIZE = 'farmListSize'
const MAX_LIST_SIZE = 400

/**
 * Queries all hosts in the database.
 * @returns hosts in the database.
 */
export async function getFarmList(): Promise<string[]> {
  let q: { [key: string]: any }

  // Query segment count.
  q = {}
  q[KEY_FARM_LIST_SIZE] = 0
  const res1: { [key: string]: number } = await chrome.storage.sync.get(q)
  const segmentCount: number = res1[KEY_FARM_LIST_SIZE]

  if (segmentCount === 0) {
    return []
  }

  // Query segments and merge into one.
  q = {}
  q = [...Array(segmentCount).keys()].map(i => KEY_FARM_LIST + i)
  const res2: { [key: string]: string[] } = await chrome.storage.sync.get(q)
  const segments = Object.values(res2)
  return segments.flat()
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
  let newList = removeDuplicates(oldList.concat(hosts))

  if (oldList.length === newList.length) {
    // No new hosts are added so do nothing.
    return []
  }

  // Break list into sections.
  let startIndex = Math.ceil(oldList.length / MAX_LIST_SIZE) - 1
  startIndex = Math.max(startIndex, 0)
  const endIndex = Math.ceil(newList.length / MAX_LIST_SIZE)
  const obj: Record<string, string[] | number> = {}
  for (let i = startIndex; i < endIndex; i++) {
    let index = i * MAX_LIST_SIZE
    obj[KEY_FARM_LIST + i] = newList.slice(index, index + MAX_LIST_SIZE)
  }
  obj[KEY_FARM_LIST_SIZE] = endIndex

  await chrome.storage.sync.set(obj)
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
  let newList = subtractArray(list, hosts)
  if (newList.length === list.length) {
    // No hosts are removed so do nothing.
    return []
  }

  // Update the entire database.
  let obj: Record<string, string[] | number> = {}
  let segmentCount = Math.ceil(newList.length / MAX_LIST_SIZE)
  for (let i = 0; i < segmentCount; i++) {
    let index = i * MAX_LIST_SIZE
    obj[KEY_FARM_LIST + i] = newList.slice(index, index + MAX_LIST_SIZE)
  }
  obj[KEY_FARM_LIST_SIZE] = segmentCount
  await chrome.storage.sync.set(obj)

  return intersectArray(list, hosts)
}
