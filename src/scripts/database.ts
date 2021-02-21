'use strict'

const KEY_FARM_LIST = 'farmList'
const KEY_FARM_LIST_SIZE = 'farmListSize'
const MAX_LIST_SIZE = 400
var database = chrome.storage.sync

function removeDuplicates(array: string[]) {
  return array.filter(
    (value, index, self) => self.indexOf(value) === index
  )
}

async function getFarmListSize(): Promise<number> {
  return new Promise<number>(res => {
    database.get(KEY_FARM_LIST_SIZE, data => res(data[KEY_FARM_LIST_SIZE]))
  })
}

const farmListDatabase = {

  /**
   * Get the currently stored farm list array.
   */
  async getFarmList(): Promise<string[]> {

    const listSize = await getFarmListSize()
    if (listSize === 0) {
      return []
    }

    return new Promise<string[]>((res, rej) => {
      const keys = []
      for (let i = 0; i < listSize; i++) {
        keys.push(KEY_FARM_LIST + i)
      }
      database.get(keys, data => {
        const mergedList = Object.values(data).flat()
        res(mergedList)
      })
    })
  },

  /**
   * Add some hosts into farm list database. 
   * @returns an array is passed in to the callback function containing all newly added hosts.
    */
  async addHosts(hosts: string | string[]): Promise<string[]> {

    if (typeof hosts === 'string') {
      // If hosts is a string, converts to array.
      return this.addHosts([hosts])
    }

    if (hosts.length === 0) {
      return []
    }

    hosts = removeDuplicates(hosts)
    const list = await this.getFarmList()
    let newList = removeDuplicates(list.concat(hosts))

    // No new hosts are added; hence return
    if (list.length === newList.length) {
      return []
    }

    let startIndex = Math.ceil(list.length / MAX_LIST_SIZE) - 1
    startIndex = Math.max(startIndex, 0)

    const endIndex = Math.ceil(newList.length / MAX_LIST_SIZE)
    const added: Record<string, string[] | number> = {}
    for (let i = startIndex; i < endIndex; i++) {
      let index = i * MAX_LIST_SIZE
      added[KEY_FARM_LIST + i] = newList.slice(index, index + MAX_LIST_SIZE)
    }
    added[KEY_FARM_LIST_SIZE] = endIndex
    return new Promise<string[]>(res => {
      database.set(added, () => res(hosts as string[]))
    })
  },

  /**
   * Remove a host from farm list database.
   * @returns a list containing removed farm url
   */
  async removeHosts(hosts: string | string[]): Promise<string[]> {

    if (typeof hosts === 'string') {
      // If hosts is a string, converts to array.
      return farmListDatabase.removeHosts([hosts])
    }

    hosts = removeDuplicates(hosts)
    if (hosts.length === 0) {
      return []
    }

    const list = await this.getFarmList()
    let newList = list.filter(e => !hosts.includes(e))
    if (newList.length === list.length) {
      // Nothing is removed
      return []
    }

    let removed = list.filter(e => hosts.includes(e))
    // No matter what update all key-values ....
    let obj: Record<string, string[] | number> = {}
    let length = Math.ceil(newList.length / MAX_LIST_SIZE)
    for (let i = 0; i < length; i++) {
      let index = i * MAX_LIST_SIZE
      obj[KEY_FARM_LIST + i] = newList.slice(index, index + MAX_LIST_SIZE)
    }
    obj[KEY_FARM_LIST_SIZE] = length
    return new Promise<string[]>(res => {
      database.set(obj, () => res(removed))
    })
  }
} 