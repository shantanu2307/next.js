import { headers } from 'next/headers'

async function abstraction() {
  await headers()
}

export default async function HeadersPage() {
  await abstraction()
  await headers()

  return <p>Done</p>
}
