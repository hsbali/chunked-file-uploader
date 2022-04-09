import { request } from "../utils/httpRequest"
import { getApiBaseUrl } from "../utils/getBaseUrlByEnv";

export const uploadRequest = async (searchParams) => {
    try {
        const res = await request(
            "GET",
            `${getApiBaseUrl()}/api/upload/request?${searchParams}`,
        )

        return res.data;
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export const upload = async (chunk, fileName, requestOptions, ) => {
    try {
        const formData = new FormData();

        formData.append("chunk", chunk, fileName);

        const options = {
            ...requestOptions
        }

        const res = await request(
            "POST",
            `${getApiBaseUrl()}/api/upload`,
            formData,
            options
        )

        return res;
    } catch (err) {
        console.log(err)
        throw err;
    }
}