import { defineComponent, shallowRef, unref, Teleport } from 'vue';
import './index.scss';
import { CloseCircleOutlined, RedoOutlined } from '@ant-design/icons-vue';
import EasySpinner from 'vue-easy-spinner'
import {setCapturedImage, setCroppedImage } from '../../store';

export const STATE = {
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
};

const noop = () => {};

export default defineComponent({
  props: [
    'state',
    'onRetry',
  ],
  setup(props, ctx) {
    const {
      children,
      state = STATE.LOADING,
      onRetry = noop,
    } = props

    const isShowRef = shallowRef(true);
  
    const renderChildren = () => {
      const state = props.state
      console.log(ctx)
      switch (state) {
        case STATE.LOADING:
          return (
            <EasySpinner
              type="spins"
              size={10}
              color="#181818"
            />
          );
        case STATE.ERROR:
          return (
            <div style={{ margin: 'auto', textAlign: 'center' }}>
              <RedoOutlined
                style={{ color: '#181818', fontSize: 40, marginBottom: 10 }}
                onClick={() => {
                  onRetry();
                }}
              />
              <div>出现了一些错误，请点击重试~</div>
            </div>
          );
        case STATE.DONE:
        default:
          return ctx.slots.default();
      }
    };
  
    return () => (
      <Teleport to="body">
        <div class="result__bg" />
        <div
          class="result__container"
          style={props.state === 'done' ? {
            height: '70vh'
          } : {
            height: '15vh'
          }}
        >
          <CloseCircleOutlined
            color="#181818"
            class="result__close"
            onClick={() => {
              isShowRef.value = false;
              setCapturedImage('')
              setCroppedImage('')
            }}
          />
          <div class="result__content">{renderChildren()}</div>
        </div>
      </Teleport>
    );
  }
})
