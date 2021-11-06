export interface IMusic {
  id?: number,
  title: string,
  artist: string,
  releaseDate: Date,
  duration: Date,
  numberViews?: number,
  feat?: boolean,
  deleted?: boolean,
  userId: number,
}
