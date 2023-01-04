import dayjs from 'dayjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import md5 from 'md5'
import { authMiddleWare } from './middleware'
const router = express.Router()

let userList = [
  {
    id: 1,
    name: process.env.ADMIN ?? 'dev1234',
    password: md5((process.env.PASS as string) ?? '!1234asdf'),
  },
]
function createToken(username: string, id: number) {
  const userInfo = { username, id }
  const token = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
    expiresIn: '3m',
  })
  const rfToken = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
    expiresIn: '120d',
  })
  return {
    message: 'success',
    success: true,
    data: {
      accessToken: token,
      refreshToken: rfToken,
      accessTokenExpiresIn: dayjs().add(3, 'minute').toISOString(),
      refreshTokenExpiresIn: dayjs().add(120, 'day').toISOString(),
    },
  }
}
function findUserById(id: number) {
  if (id === undefined || isNaN(id)) return null
  const user = userList.find((item) => item.id === id)
  if (user) {
    return user
  } else {
    return null
  }
}
function findUserByName(name: string) {
  if (name === undefined) return null
  const user = userList.find((item) => item.name === name)
  if (user) {
    return user
  } else {
    return null
  }
}
router.post('/signup', (req, res, next) => {
  const { username, password } = req.body
  if (!username) {
    res.status(404).json({ message: '이름 입력 필요', success: false })
    return
  }
  if (!password) {
    res.status(404).json({ message: '암호 입력 필요', success: false })
    return
  }
  const user = findUserByName(username)
  if (user) {
    res.status(403).json({
      message: '중복된 아이디',
      error: '중복된 아이디',
      success: false,
    })
    return
  }
  const nextId =
    userList.sort((a, b) => a.id - b.id)[userList.length - 1].id + 1
  userList = [
    ...userList,
    {
      id: nextId,
      name: username,
      password,
    },
  ]
  res.json(createToken(username, nextId))
})

router.post('/refresh', (req, res, next) => {
  try {
    let { accessToken } = req.body
    accessToken = accessToken.replace(`Bearer `, '')
    const decoded = jwt.decode(accessToken ?? '') as any
    if (!decoded) {
      res
        .status(401)
        .json({ message: '유효하지 않은 토큰 값.', success: false })
      return
    }
    let refreshToken = req.headers.authorization
    if (!refreshToken) {
      res
        .status(401)
        .json({ message: '유효하지 않은 갱신 토큰 값.', success: false })
      return
    }
    if (refreshToken) refreshToken = refreshToken.replace('Bearer ', '')
    let checkIsValid = jwt.verify(refreshToken, process.env.SALT ?? '더블디')
    if (checkIsValid) {
      const { username, id } = jwt.decode(refreshToken ?? '') as any
      const userInfo = { username, id }

      const token = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
        expiresIn: '3m',
      })
      const rfToken = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
        expiresIn: '120d',
      })
      res.json({
        message: 'success',
        success: true,
        data: {
          accessToken: token,
          refreshToken: rfToken,
          accessTokenExpiresIn: dayjs().add(3, 'minute').toISOString(),
          refreshTokenExpiresIn: dayjs().add(120, 'day').toISOString(),
        },
      })
    }
  } catch (error: any) {
    res.status(401).json({ message: error?.message ?? 'error', success: false })
    return
  }
})

router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  if (!username) {
    res.status(404).json({ message: '이름 입력 필요', success: false })
    return
  }
  if (!password) {
    res.status(404).json({ message: '암호 입력 필요', success: false })
    return
  }
  const user = findUserByName(username)
  if (!user) {
    res.status(400).json({ message: 'Not Found', success: false })
    return
  }
  if (md5(password) !== user.password) {
    res.status(401).json({ message: '일치하는 값이 없습니다.', success: false })
    return
  }
  const userInfo = { username: user.name, id: user.id }
  const token = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
    expiresIn: '3m',
  })
  const rfToken = jwt.sign(userInfo, process.env.SALT ?? '더블디', {
    expiresIn: '120d',
  })
  res.json({
    message: 'success',
    success: true,
    data: {
      accessToken: token,
      refreshToken: rfToken,
      accessTokenExpiresIn: dayjs().add(3, 'minute').toISOString(),
      refreshTokenExpiresIn: dayjs().add(120, 'day').toISOString(),
    },
  })
})
router.get('/', authMiddleWare, (req, res, next) => {
  const user = findUserById(Number(req.headers.user_id))
  if (!user) {
    res.status(400).json({ message: 'Not Found', success: false })
    return
  }
  res.json({
    message: 'success',
    data: user,
    success: true,
  })
})
export default router
