import { Fragment, useRef, useState, useContext } from "react"
import cx from "classnames";
import UploadContext from "../contexts/UploadContext";

export default function UploadForm() {
    const { files, setFiles, setShowUploadStatus } = useContext(UploadContext);

    const fileInput = useRef();
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    const validFileTypes = ['.mp4', '.jpg', '.jpeg', '.png', '.gif', '.mov'];

    const updateFiles = (newFileList) => {
        const fileArr = Object.values(newFileList);
        setError(null);
        for (let i = 0; i < fileArr.length; i++) {
            const ext = fileArr[i].name.split('.').pop();
            if (!validFileTypes.includes(`.${ext}`)) {
                return setError(`Cannot upload .${ext} file`);
            }
            if (files.some(file => file.name === fileArr[i].name)) {
                return setError(`"${fileArr[i].name}" is already selected`)
            }
        }

        return setFiles(prev => [...prev, ...fileArr]);
    }

    const removeFile = (e, index) => {
        e.stopPropagation();
        setFiles(prev => prev.filter((el, i) => i !== index));
    }

    const dragOver = (e) => {
        e.preventDefault();
        setIsDragging(true)
    }

    const dragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true)
    }

    const dragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false)
    }

    const fileDrop = (e) => {
        e.preventDefault();
        updateFiles(e.dataTransfer.files);
        setIsDragging(false)
    }

    const handleChange = (e) => {
        updateFiles(e.target.files);
    }

    const onSubmit = (e) => {
        e.preventDefault()
        setError(null);
        setShowUploadStatus(true)
    }

    return (
        <>
            <main className="container mx-auto py-12 px-4">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-6">Upload Multiple Files in Chunks</h1>

                    <form onSubmit={(e) => onSubmit(e)}>
                        <div className="text-center">

                            <div className={cx("font-medium border-4 border-dashed w-full p-4 rounded-lg", { "border-gray-600 text-gray-600 bg-gray-100": isDragging }, { "border-red-500 text-red-500 bg-gray-100": error }, { "bg-gray-100 text-gray-500 border-gray-300": !isDragging && !error })}
                                onDragOver={dragOver}
                                onDragEnter={dragEnter}
                                onDragLeave={dragLeave}
                                onDrop={fileDrop}
                            >
                                <input type="file" accept={validFileTypes.join(',')} hidden multiple ref={fileInput} onChange={handleChange} />
                                <p className="mb-4">Drop files here or Click Upload</p>
                                <button className={cx("border px-2 py-1 text-sm font-medium outline-none", { "border-gray-600": isDragging }, { "border-red-500 text-red-500": error }, { "border-gray-500": !isDragging && !error })} type="button" onClick={() => fileInput.current && fileInput.current.click()}>
                                    Upload
                                </button>
                                {files.length !== 0 ? (
                                    <>
                                        <ul className="font-base mt-3 flex items-center flex-wrap gap-x-3">
                                            {files.map((file, i) => {
                                                return (
                                                    <Fragment key={i}>
                                                        <li>{file.name}<span className="hover:text-red-500 cursor-pointer ml-1.5" onClick={(e) => removeFile(e, i)}>X</span></li>
                                                    </Fragment>
                                                )
                                            })}
                                        </ul>
                                    </>
                                ) : ""}
                            </div>
                            {error ? (
                                <div className="text-left w-full mx-2">
                                    <small className="text-red-500 font-medium text-sm my-1.5">{error}</small>
                                </div>
                            ) : ""}

                            <button disabled={files.length === 0} type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg py-2 px-8 hover:shadow-2xl shadow-blue-500 disabled:opacity-50 disabled:shadow-none w-full transition-all duration-100 mt-4">Upload</button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}