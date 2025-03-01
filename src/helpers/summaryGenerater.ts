import axios from "axios";

export const summaryGenerater = async (comments: string[]) => {
    const res: string[] = [];
    let summary: string = "";

    const concatenedComments = comments.join(" ");
    
    const responce = await axios.post("http://192.168.155.155:5000/predict", {
        text: concatenedComments,
        task: "summary"
    })

    console.log(concatenedComments);
    return responce.data.result as string;
}