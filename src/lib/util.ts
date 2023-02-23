import {
  citiesSample,
  example,
  monthlyDataList,
  sampleAreaGroup,
  sampleSkillsGroup,
  sampleStreets,
  sampleUserList,
  sampleUserType,
} from './samples'

let nextList = sampleStreets.filter((curr) => !curr.isAll)
let checkedAll = sampleStreets
  .filter((item) => item.isAll && item.selected)
  .map((item) => item.parent)
nextList = nextList.map((item) =>
  checkedAll.includes(item.parent) ? { ...item, selected: true } : item
)
export let listTargetType = {
  user: sampleUserList,
  prod: example,
  area: sampleAreaGroup,
  skill: sampleSkillsGroup,
  streets: nextList,
  cities: citiesSample,
  monthly: monthlyDataList,
}
export type SampleListObjectType = typeof listTargetType
export const isTargetType = (
  value: string
): value is keyof SampleListObjectType => {
  return (
    value !== undefined &&
    listTargetType[value as keyof SampleListObjectType] !== undefined
  )
}
export interface TestResponse {
  message: string
  data: sampleUserType[]
  success: boolean
  total: number
  _next: number
}

export type GetList<T> = <K extends keyof T>(item: T, target: K) => T[K]
export type DeleteList<T> = <K extends keyof T>(
  item: T,
  target: K,
  id: number
) => void
export type UpdateList<T> = <K extends keyof T>(
  item: T,
  target: K,
  id: number,
  value: any
) => void
export const getList: GetList<SampleListObjectType> = (item, target) => {
  return item[target]
}

export const updateList: UpdateList<SampleListObjectType> = (
  item,
  target,
  id,
  value
) => {
  if (!item[target]) return
  let nextItem = item[target].map((prev) =>
    prev.id === id ? { ...prev, ...value } : prev
  )
  listTargetType = { ...item, [target]: nextItem }
}

export const deleteList: DeleteList<SampleListObjectType> = (
  item,
  target,
  id
) => {
  let nextItem = item[target]
  if (!nextItem) return
  nextItem = (nextItem as any).filter((prev: any) => prev.id !== id)
  listTargetType = { ...item, [target]: nextItem }
}
