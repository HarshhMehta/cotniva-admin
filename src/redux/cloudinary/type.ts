export interface ICloudinaryDeleteResponse {
  status: string;
  message: string;
  data: any;
}

export interface ICloudinaryPostResponse {
  success?: boolean;
  status?: string;
  message: string;
  data: { url: string; id: string; resourceType?: string };
}

export interface ICloudinaryMultiplePostRes {
  success: boolean;
  message: string;
  data: {url:string,id:string}[] | [];
}