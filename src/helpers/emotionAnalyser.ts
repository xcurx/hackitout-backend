import axios from "axios"

export const emotionAnalyser = async (comments: string[]): Promise<string> => {
    const res: string[] = [];
    let emotion: string = "";

    await Promise.all(comments.map(comment => 
        axios.post("http://192.168.155.155:5000/predict", {
            text: comment,
            task: "emotion"
        })
        .then((response) => {
            res.push(response.data.result);
        })
        .catch((error) => {
            console.error(error);
        })
    ));

    //joy sadness anger fear surprise love
    const emotionCount: { [key: string]: number } = {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        love: 0
    };

    res.forEach(emotion => {
        if (emotion in emotionCount) {
            emotionCount[emotion]++;
        }
    });

    const totalComments = res.length;
    const emotionPercentage: { [key: string]: string } = {};

    for (const emotion in emotionCount) {
        emotionPercentage[emotion] = ((emotionCount[emotion] / totalComments) * 100).toFixed(2);
    }

    let maxEmotion = "";
    let maxPercentage = 0;

    for (const emotion in emotionPercentage) {
        const percentage = parseFloat(emotionPercentage[emotion]);
        if (percentage > maxPercentage) {
            maxPercentage = percentage;
            maxEmotion = emotion;
        }
    }

    console.log(`${maxEmotion}: ${maxPercentage}%`);
    return `${maxEmotion}: ${maxPercentage}%`;
}