/**
 * 一键识别
 */
const clickRecognize = () => {
    // 1. 匹配 (123, 200, 67)
    const regexFirst = /\s*\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)\s*/;
    const match = inputRgbColor.value.match(regexFirst);

    if (match) {
        inputRedColor.value = parseInt(match[1], 10).toString();
        inputGreenColor.value = parseInt(match[2], 10).toString();
        inputBlueColor.value = parseInt(match[3], 10).toString();
        return;
    }

    // 2. 匹配 rgb(123, 200, 67) 或者 RGB(123, 200, 67)
    const regexSecond = /\s*(rgb|RGB)\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)/;
    const matchSecond = inputRgbColor.value.match(regexSecond);

    if (matchSecond) {
        inputRedColor.value = parseInt(matchSecond[2], 10).toString();
        inputGreenColor.value = parseInt(matchSecond[3], 10).toString();
        inputBlueColor.value = parseInt(matchSecond[4], 10).toString();
        return;
    }

    // 3. 匹配 123 200 67
    const regexThird = /^\s*(\s*25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*$/;
    const matchThird = inputRgbColor.value.match(regexThird);

    if (matchThird) {
        inputRedColor.value = parseInt(matchThird[1], 10).toString();
        inputGreenColor.value = parseInt(matchThird[2], 10).toString();
        inputBlueColor.value = parseInt(matchThird[3], 10).toString();
        return;
    }

    // 4. 匹配 123, 200, 67
    const regexFourth = /^\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*$\s*/;
    const matchFourth = inputRgbColor.value.match(regexFourth);

    if (matchFourth) {
        inputRedColor.value = parseInt(matchFourth[1], 10).toString();
        inputGreenColor.value = parseInt(matchFourth[2], 10).toString();
        inputBlueColor.value = parseInt(matchFourth[3], 10).toString();
        return;
    }

    ElMessage.error("智能识别失败, 请检查 RGB 格式");
}