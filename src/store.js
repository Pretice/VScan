import { shallowRef } from "vue";

const capturedImageRef = shallowRef('')
function setCapturedImage(img) {
    capturedImageRef.value = img
} 
const croppedImageRef = shallowRef('')
function setCroppedImage(img) {
    croppedImageRef.value = img
}

export {
    capturedImageRef,
    setCapturedImage,
    croppedImageRef,
    setCroppedImage,
}
