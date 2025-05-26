export type StatusObject = {
  status: "failed" | "pending"| "completed" |"retrying",
  message:string,
  data?:{
    text:string,
    author?:string,
    title:string,
    category:"fiction"|"non-fiction",
    imageUrl?:string
  }
};