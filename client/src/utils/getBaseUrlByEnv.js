export function getWebBaseUrl() {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000"
    } else if (process.env.NODE_ENV === "production") {
        return ""
    }
}

export function getApiBaseUrl() {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:5000"
    } else if (process.env.NODE_ENV === "production") {
        return ""
    }
}