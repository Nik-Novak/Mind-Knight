type Stage = {
  name: string,
  description?: string,
  status: 'pending' | 'failed' | 'succeeded',
  progress_milestone: number // 0 to 1
}

type ProgressiveRequest = {
  id: string,
  progress: number,
  stages: Stage[]
}