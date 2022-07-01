/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from "react";
import { Notyf } from "notyf";
import axios from "axios";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { DropUploader } from "./components";

interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data?: T;
}

const baseApiUrl = process.env.REACT_APP_BASE_API_URL as string;

export default function App() {
  const [image, setImages] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const notyf = new Notyf({
    position: {
      x: "center",
      y: "top",
    },
  });

  const handleOnDrop = async (files: File[]) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", files[0]);

    const upload = await axios.post<ApiResponse<{ path: string }>>(`${baseApiUrl}/api/v1/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": process.env.REACT_APP_API_KEY as string,
      },
    });

    if (upload.status === 200) {
      setIsLoading(false);
      return setImages(upload.data.data?.path as string);
    }

    setIsLoading(false);
    console.error(upload);
    return notyf.error("Unknown error");
  };

  const handleDelete = async (filePath: string) => {
    setIsLoading(true);

    const deleteImage = await axios.delete<ApiResponse<null>>(`${baseApiUrl}/api/v1${filePath}`, {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY as string,
      },
    });

    if (deleteImage.status === 200) {
      notyf.success(deleteImage.data.message);
      setIsLoading(false);
      return setImages(null);
    }

    setIsLoading(false);
    console.error(deleteImage);
    return notyf.error("Unknown error");
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files) {
      handleOnDrop(Array.from(files));
    }
  };

  const handleCopyLink = () => {
    if (image) {
      if ("clipboard" in navigator) {
        navigator.clipboard.writeText(baseApiUrl + image);
        notyf.success("Link copied to clipboard");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = baseApiUrl + image;
        textarea.className = "hidden";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        notyf.success("Link copied to clipboard");
      }
    }
  };

  // Ping the server to check if it's running
  useEffect(() => {
    const ping = async () => {
      const url = process.env.REACT_APP_BASE_API_URL as string;
      const response = await axios.get<ApiResponse<null>>(url);
      console.info(response.data.message);
    };

    ping();
  }, []);

  return (
    <div className="container text-center min-h-screen flex flex-col items-center justify-center">
      <h1>Image as a Service</h1>
      <p>
        This is a simple image as a service application. It allows you to upload an image and get a link to it.
      </p>

      <DropUploader onDrop={handleOnDrop} className="mt-8">
        {image ? (
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <div className="w-full flex-1 pt-6 sm:pl-6 text-center">
              <p className="mb-4">
                Uploaded image:
              </p>
              <a
                href={baseApiUrl + image}
                className="mb-6 text-black p-3 rounded font-semibold bg-primary block break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {baseApiUrl + image}
              </a>

              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6">
                <button
                  type="button"
                  className="py-4 px-6 text-sm rounded text-white bg-red-500 disabled:opacity-50 font-medium"
                  disabled={isLoading}
                  onClick={() => handleDelete(image)}
                >
                  Delete
                </button>

                <button
                  type="button"
                  className="py-4 px-6 text-sm rounded text-black bg-primary disabled:opacity-50 font-medium"
                  disabled={isLoading}
                  onClick={handleCopyLink}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label htmlFor="upload-image" className={`bg-transparent hover:bg-gray-900 transition-[background] duration-300 ease-in-out p-6 rounded border border-dashed border-primary min-w-[272px] text-center min-h-[250px] flex flex-col items-center justify-center ${isLoading ? "opacity-50" : ""}`}>
            <AiOutlineCloudUpload className="text-primary text-7xl sm:text-8xl inline-block" />
            <p className="max-w-xs">
              {isLoading ? "Uploading..." : "Drag and drop an image here or click to select an image to upload."}
            </p>

            <input
              type="file"
              name="image"
              id="upload-image"
              className="hidden"
              disabled={isLoading}
              onChange={handleUploadFile}
            />
          </label>
        )}
      </DropUploader>

      <p className="mt-12">
        This is a free service. You can use it for free.
      </p>

      <p className="copyright">
        ©
        {" "}
        {new Date().getFullYear()}
        {" "}
        <a href="https://www.andriann.co" className="text-primary" target="_blank" rel="noopener noreferrer">
          Andriann
        </a>
      </p>

    </div>
  );
}
