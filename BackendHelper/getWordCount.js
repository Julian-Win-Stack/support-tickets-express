export function getWordCount(text){
    return text.trim().split(/\s+/).filter(Boolean).length;
}