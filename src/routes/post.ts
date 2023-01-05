import express from 'express'
import { sampleProdType } from '../lib/samples'
import {
  deleteList,
  getList,
  isTargetType,
  listTargetType,
  updateList,
} from '../lib/util'
import { authMiddleWare } from './middleware'
const isProd = (value: any): value is sampleProdType => {
  return (
    'code' in value ||
    'brand' in value ||
    'createdAt' in value ||
    'article' in value ||
    'title' in value ||
    'state' in value
  )
}
const router = express.Router()
router.delete('/:id', authMiddleWare, (req, res, next) => {
  const id = req.params.id
  if (!listTargetType['prod'].find((item) => item.id === Number(id))) {
    res
      .status(400)
      .json({ message: '해당하는 값이 없습니다..', success: false })
  }
  deleteList(listTargetType, 'prod', Number(id))
  res.json({
    message: 'success',
    data: id,
    success: true,
  })
})
router.patch('/:id', authMiddleWare, (req, res, next) => {
  const id = req.params.id
  const values = req.body
  if (!listTargetType['prod'].find((item) => item.id === Number(id))) {
    res
      .status(400)
      .json({ message: '해당하는 값이 없습니다..', success: false })
  }

  if (!values) {
    res.status(400).json({ message: '변경할 값이 없습니다.', success: false })
    return
  }
  if (!isProd(values)) {
    res.status(400).json({ message: '유효한 값이 아닙니다.', success: false })
    return
  }
  updateList(listTargetType, 'prod', Number(id), values)
  res.json({
    message: 'success',
    data: listTargetType['prod'].find((item) => item.id === Number(id)),
    success: true,
  })
})
router.get('/:id', authMiddleWare, (req, res, next) => {
  const target = 'prod'
  const id = Number(req.params.id)
  if (!isTargetType(target)) {
    res.json({
      message: 'Not Found Api',
      success: false,
      data: null,
    })
    return
  }
  const dummyList: { id: number }[] = getList(listTargetType, target)
  if (!dummyList.some((item) => item.id === id)) {
    res.json({
      message: 'Not Found Api',
      success: false,
      data: null,
    })
    return
  }
  res.json({
    message: 'success',
    success: false,
    data: dummyList.find((item) => item.id === id),
  })
})
router.get('/', authMiddleWare, (req, res, next) => {
  const target = 'prod'
  if (!isTargetType(target)) {
    res.json({
      message: 'Not Found Api',
      success: false,
      data: null,
    })
    return
  }
  const dummyList: { id: number }[] = getList(listTargetType, target)

  const searchTerm = (req.query.search ?? '') as string
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 12
  const cursor = Number(req.query.cursor) ? Number(req.query.cursor) : 0

  const filteredList = dummyList.filter((item) => {
    return JSON.stringify(Object.values(item).join(' ')).includes(searchTerm)
  })

  const cursorIndex = filteredList.findIndex((item) => item.id === cursor) ?? 0

  const paged =
    cursor < filteredList.length
      ? filteredList.slice(cursorIndex + 1, cursorIndex + limit + 1)
      : []

  let nextCursor = paged[paged.length - 1]?.id ?? null
  res.json({
    message: 'success',
    success: true,
    data: {
      list: paged,
      count: filteredList.length,
      _next:
        limit === paged.length &&
        typeof nextCursor === 'number' &&
        filteredList[filteredList.length - 1].id !== nextCursor
          ? nextCursor
          : null,
    },
  })
})
export default router
