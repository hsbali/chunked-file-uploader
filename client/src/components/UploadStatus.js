import { Fragment, useContext, useEffect, useReducer } from "react"

import UploadContext from "../contexts/UploadContext"

import { upload, uploadRequest } from "../actions/upload";

const ACTIONS = {
    NEW_UPLOAD_STATUS: "NEW_UPLOAD_STATUS",
    UPDATE_UPLOAD_STATUS: "UPDATE_UPLOAD_STATUS",
    PAUSE_UPLOAD_STATUS: "PAUSE_UPLOAD_STATUS",
    CANCEL_UPLOAD_STATUS: "CANCEL_UPLOAD_STATUS",
    DELETE_UPLOAD_STATUS: "DELETE_UPLOAD_STATUS",
    COMPLETE_UPLOAD_STATUS: "COMPLETE_UPLOAD_STATUS",
    FAIL_UPLOAD_STATUS: "FAIL_UPLOAD_STATUS",
}

const uploadStatusReducer = (state, action) => {
    const { type, payload } = action;

    switch (type) {
        case ACTIONS.NEW_UPLOAD_STATUS:
            return {
                ...state,
                [payload.name]: {
                    currProgress: 0,
                    filePath: null,
                    error: null
                }
            }
        case ACTIONS.UPDATE_UPLOAD_STATUS:
            console.log(payload.loaded, payload.total)
            return {
                ...state,
                [payload.name]: {
                    ...state[payload.name],
                    currProgress: Math.round((payload.loaded * 100) / payload.total),
                }
            }
        case ACTIONS.COMPLETE_UPLOAD_STATUS:
            return {
                ...state,
                [payload.name]: {
                    ...state[payload.name],
                    filePath: payload.filePath
                }
            }
        case ACTIONS.FAIL_UPLOAD_STATUS:
            return {
                ...state,
                [payload.name]: {
                    ...state[payload.name],
                    error: payload.error,
                    filePath: null
                }
            }
        default:
            break;
    }
}

export default function UploadStatus() {
    const { files } = useContext(UploadContext);

    const [uploadStatusState, dispatch] = useReducer(uploadStatusReducer, {})

    const defaultUploadOptions = {
        startingByte: 0
    }

    const uploadFile = async (file, options=defaultUploadOptions) => {
        const requestParams = new URLSearchParams();
        requestParams.set('fileName', file.name)

        dispatch({
            type: ACTIONS.NEW_UPLOAD_STATUS,
            payload: {
                name: file.name
            }
        })

        const { data } = await uploadRequest(requestParams.toString());

        if (!data) {
            dispatch({
                type: ACTIONS.FAIL_UPLOAD_STATUS,
                payload: {
                    name: file.name,
                    error: "Invalid Upload Request"
                }
            })
        }

        //upload actual file
        const chunk = file.slice(options.startingByte);

        const requestOptions = {
            headers: {
                'Content-Range': `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`,
                'X-File-Id': data.fileId,
            },
            onUploadProgress: (e) => {
                dispatch({
                    type: ACTIONS.UPDATE_UPLOAD_STATUS,
                    payload: {
                        name: file.name,
                        loaded: e.loaded,
                        total: e.total
                    }
                })
            },
        }

        const res = await upload(chunk, file.name, requestOptions);

        if (res.status === 200) {
            dispatch({
                type: ACTIONS.COMPLETE_UPLOAD_STATUS,
                payload: {
                    name: file.name,
                    filePath: res.data.data.filePath,
                }
            });
        } else {
            dispatch({
                type: ACTIONS.FAIL_UPLOAD_STATUS,
                payload: {
                    name: file.name,
                    error: "Upload Failed"
                }
            })
        }
    }

    useEffect(() => {
        if (Array.isArray(files) && files.length !== 0) {
            for (let i = 0; i < files.length; i++) {
                uploadFile(files[i]);
            }
        }
    }, [])

    return (
        <>
            <main className="container mx-auto py-12 px-4">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-6">Upload Status</h1>
                    {Object.keys(uploadStatusState).map((fileName, i) => {
                        return (
                            <Fragment key={i}>
                                <div className="my-4">

                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold grow">
                                            {fileName}
                                        </h3>
                                        <p className="text-lg font-bold">
                                            {uploadStatusState[fileName].currProgress}%
                                        </p>

                                    </div>
                                    <div className="h-2 w-full bg-gray-400 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200 rounded-full" style={{ width: `${uploadStatusState[fileName].currProgress}%` }}></div>
                                    </div>
                                </div>
                            </Fragment>
                        )
                    })}
                </div>
            </main>
        </>
    )
}