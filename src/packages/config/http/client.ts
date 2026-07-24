import axios from 'axios'

import { env } from '@/packages/config/env'
import { generateRedirectPathWithParams } from '@/packages/utils/generate-redirect-path-with-params'
const currentUrl = generateRedirectPathWithParams()

const baseURL = env.apiUrl

const http = axios.create({
  baseURL,
  headers: {
    'x-url-front': currentUrl || '',
  },
})

export default http
