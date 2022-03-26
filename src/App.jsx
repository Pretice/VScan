import './App.scss';
import Webcam from 'simple-vue-camera';
import V3Cropper from 'vue3-cropperjs';
import 'vue3-cropperjs/dist/v3cropper.css';

import Toast from 'antd-mobile-vue-next/es/toast';
import 'antd-mobile-vue-next/es/toast/style/index.less';
// for loading animation
import 'antd-mobile-vue-next/es/icon/style/index.less';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/scss';

// icon
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';

// face detection
import * as faceApi from 'face-api.js';
import {
  interpolateAgePredictions,
  gender2Emoji,
  expression2Emoji,
} from './utils/faceHelper';
import { blobToBase64 } from './utils/picConvertHelper';
// BaiduApi classify pic
import BaiduApi from './components/BaiduApi';

// state data
import {
  croppedImageRef as croppedImgRef,
  capturedImageRef as capturedImgRef,
} from './store';

import {
  computed,
  defineComponent,
  onMounted,
  ref,
  shallowRef,
  watchEffect,
  getCurrentInstance
} from 'vue';

const apiList = [
  {
    name: '识物',
    component: BaiduApi,
  },
  {
    name: '识人',
    component: null,
    canCapture: false,
    front: true,
  },
];

// rear video constraints
const videoConstraints = {
  height: window.innerWidth * devicePixelRatio * 1.5,
  width: (window.innerHeight - 64) * devicePixelRatio * 1.5,
  facingMode: 'environment',
  deviceId: {},
};

// front video constraints
const frontVideoConstraints = {
  height: window.innerWidth * devicePixelRatio,
  width: (window.innerHeight - 64) * devicePixelRatio,
  facingMode: 'user',
  deviceId: {},
};

const WebcamCapture = defineComponent({
  props: ['onCropDone', 'camConstraints', 'shouldShowCapture'],
  setup(props, ctx) {
    const {
      onCropDone,
      camConstraints = videoConstraints,
      shouldShowCapture = true,
    } = props;

    const webcamRef = ref();
    const cropperRef = shallowRef();

    onMounted(() => {
      // console.log('video: ',ctx.$refs.webcamRef.video)
      // console.log('video: ',getCurrentInstance().ctx.$refs.webcamRef.video)
    })

    watchEffect(() => {
      if (props.camConstraints && webcamRef.value) {
        setTimeout(() => {
          webcamRef.value.start()
        }, 0);
      }
    })

    const camRef = computed(() =>
      props.camConstraints === videoConstraints ? 1 : 0
    );

    const capture = async () => {
      const imageBlob = await webcamRef.value.snapshot();
      const imageSrc = await blobToBase64(imageBlob);
      capturedImgRef.value = imageSrc;
    };

    const handleDoneClick = () => {
      croppedImgRef.value = cropperRef.value
        .getCroppedCanvas({
          imageSmoothingEnabled: false,
          imageSmoothingQuality: 'high',
        })
        .toDataURL();
    };

    const handleBackClick = () => {
      capturedImgRef.value = null;
      croppedImgRef.value = null;
    };

    watchEffect(() => {
      // eslint-disable-next-line no-unused-expressions
      typeof onCropDone === 'function' ? onCropDone(croppedImgRef.value) : null;
    });

    // face effect
    const videoLoaded = shallowRef(false);
    const frameIdRef = shallowRef();
    const toastInst = shallowRef();
    const modelDidLoad = shallowRef(false);

    let timerId;
    watchEffect((clearEffect) => {
      const cam = camRef.value;
      modelDidLoad.value;

      // 后置不检测
      if (cam === 1) {
        // 停止檢測
        clearInterval(timerId);
        console.log('使用后置 cam');
        return () => {
          videoLoaded.value = false;
        };
      }

      if (!videoLoaded) {
        // do nothing
        return;
      }

      console.log('detecting...');

      // show loading toast
      if (!faceApi.nets.tinyFaceDetector.isLoaded) {
        toastInst.value = Toast.loading('加载模型中...', 15);
      }

      async function initFaceApi() {
        await faceApi.nets.tinyFaceDetector.load('/models');
        await faceApi.nets.ageGenderNet.load('/models');
        await faceApi.nets.faceExpressionNet.load('/models');
      }

      async function detectFace() {
        const videoEl = webcamRef.value.video;

        const result = await faceApi
          // .detectSingleFace(videoEl, new faceApi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
          .detectSingleFace(videoEl, new faceApi.TinyFaceDetectorOptions())
          .withAgeAndGender()
          .withFaceExpressions();

        console.log('decting...', result);

        if (result) {
          const canvas = document.querySelector('.face__overlay');
          if (canvas) {
            const dims = faceApi.matchDimensions(canvas, videoEl, true);

            const resizedResult = faceApi.resizeResults(result, dims);

            console.log(resizedResult);
            // draw default detection box
            // faceApi.draw.drawDetections(canvas, resizedResult);
            const { age, gender, genderProbability, expressions } =
              resizedResult;

            const interpolatedAge = interpolateAgePredictions(age);

            Toast.info(
              `性别: ${gender2Emoji(gender)}\n年龄: ${interpolatedAge.toFixed(
                1
              )}\n表情: ${expression2Emoji(
                expressions?.asSortedArray()[0].expression
              )}`
            );

            // interpolate gender predictions over last 30 frames
            // to make the displayed age more stable
            // draw default result label
            // new faceApi.draw.DrawTextField(
            //   [
            //     `${faceApi.utils.round(interpolatedAge, 0)} years`,
            //     `${gender} (${faceApi.utils.round(genderProbability)})`,
            //   ],
            //   result.detection.box.bottomLeft
            // ).draw(canvas);
            new faceApi.draw.DrawBox(resizedResult.detection.box, {
              boxColor: '#07c160',
              lineWidth: 5,
            }).draw(canvas);
          }
        }
      }

      initFaceApi().then(() => {
        console.info('face model loaded~');
        toastInst.value?.hide();
        timerId = setInterval(() => {
          detectFace();
        }, 16);
      });

      // clear face api effect
      return () => {
        if (frameIdRef.value) {
          console.log('cancel face api task');
          cancelAnimationFrame(frameIdRef.value);
          frameIdRef.value = null;
        }
        videoLoaded.value = false;
      };
    });

    return () => {
      if (croppedImgRef.value) {
        console.log('@@', croppedImgRef.value);
        return (
          <>
            <div class="cropped-img__container">
              <img src={croppedImgRef.value} style={{ width: '100%' }} />
            </div>
          </>
        );
      }

      if (capturedImgRef.value) {
        return (
          <>
            <V3Cropper
              src={capturedImgRef.value}
              style={{ height: '100%', width: '100%' }}
              class="cam-cropper"
              // Cropper.js options
              dragMode="move"
              background={false}
              initialAspectRatio={1}
              guides={false}
              ref={cropperRef}
            />
            <div key="captured">
              <button class="crop-btn back" onClick={handleBackClick}>
                <CloseOutlined style={{ fontSize: 20, color: '#07c160' }} />
              </button>
              <button class="crop-btn done" onClick={handleDoneClick}>
                <CheckOutlined style={{ fontSize: 20, color: '#fa5151' }} />
              </button>
            </div>
          </>
        );
      }
      return (
        <>
          <div class="cam__container">
            <div
              class="cam__media"
            >
              {!camRef.value && (
                <>
                  <Webcam //使用前置
                    constraints={{ video: frontVideoConstraints, audio: false }}
                    ref={webcamRef}
                    autoplay
                    onLoadedMetadata={() => (videoLoaded.value = true)}
                  />
                  <canvas class="face__overlay" />
                </>
              )}
            </div>
            <div
              class="cam__media"
              style={{
                opacity: camRef.value,
              }}
            >
              {!!camRef.value && (
                <Webcam //使用后置
                  ref={webcamRef}
                  constraints={{ video: videoConstraints, audio: false }}
                  autoplay
                />
              )}
            </div>
          </div>
          <div key="streaming">
            <button
              class={`capture-btn ${shouldShowCapture ? '' : 'hidden'}`}
              onClick={capture}
            />
          </div>
        </>
      );
    };
  },
});

const App = defineComponent({
  setup() {
    const imgRef = shallowRef();
    const apiComRef = shallowRef(apiList[0].component);
    const currentApiRef = shallowRef(0);

    // 使用前置或者后置
    const camConstraints = computed(() =>
      apiList[currentApiRef.value].front
        ? frontVideoConstraints
        : videoConstraints
    );
    // 是否展示捕捉图片的按钮
    const shouldShowCapture = computed(
      () => (apiList[currentApiRef.value].canCapture === false ? false : true)
    );

    return () => {
      const ApiComp = apiComRef.value;

      return (
        <div class="App">
          <div class="app__main">
            <WebcamCapture
              onCropDone={(croppedImg) => {
                imgRef.value = croppedImg;
              }}
              camConstraints={camConstraints.value}
              shouldShowCapture={shouldShowCapture.value}
            />
          </div>
          <div class="selector__container">
            <Swiper
              class="selector__swiper"
              centeredSlides
              slideToClickedSlide
              spaceBetween={50}
              slidesPerView="auto"
              onSlideChange={(e) => {
                typeof window.navigator.vibrate === 'function' &&
                  window.navigator.vibrate(50);
                console.log('slide change', e);
                apiComRef.value = apiList[e.activeIndex].component;
                currentApiRef.value = e.activeIndex;
                console.log('滑動了');
                console.log(currentApiRef.value);
              }}
            >
              {apiList.map((api) => {
                return <SwiperSlide>{api.name}</SwiperSlide>;
              })}
            </Swiper>
            <div class="selector__indicator" />
          </div>
          {imgRef.value && apiComRef.value && <ApiComp img={imgRef.value} />}
        </div>
      );
    };
  },
});

export default App;
