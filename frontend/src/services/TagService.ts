import axios from "axios";

export const getAllTags = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`);
    return response.data;
}