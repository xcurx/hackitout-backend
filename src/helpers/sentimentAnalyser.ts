import axios from "axios"

export const sentimentAnalyser = async (comments: string[]): Promise<string> => {
    const res: string[] = [];
    let sentiment: string = "";

    await Promise.all(comments.map(comment => 
        axios.post("http://192.168.155.155:5000/predict", {
            text: comment,
            task: "sentiment"
        })
        .then((response) => {
            res.push(response.data.result);
        })
        .catch((error) => {
            console.error(error);
        })
    ));

    const emotionCount: { [key: string]: number } = {
        positive: 0,
        negative: 0,
        neutral:0,
        irrelevant:0
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