import { shallowRef, unref, defineComponent, computed} from 'vue';
import {useRequest} from 'vue-request'
import qs from 'qs';
import Badge from 'antd-mobile-vue-next/es/badge';
import 'antd-mobile-vue-next/es/badge/style/index.less';
import axios from '../../utils/axios';
import Result, { STATE } from '../Result';
import './index.scss';

const fetchBaiduSearchRes = (image) => {
  return axios.post(
    `https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?${qs.stringify(
      { access_token: import.meta.env.VITE_APP_BAIDU_KEY }
    )}`,
    `image=${encodeURIComponent(image)}&baike_num=2`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
};

const BaiduApiPreview = defineComponent({
  props: ['data'],
  setup(props) {
    const {data} = props
    const baikeImage = data?.baike_info?.image_url || '';
    const proxyBaikeImage = baikeImage.split('/').slice(-1).pop();

    return () => (
      <div className="baidu-card__container">
        <div className="baidu-card__title">{data?.keyword}</div>
        <div className="baidu-card__label">
          {
            <>
              <Badge
                text={data?.root}
                style={{
                  padding: '0 3px',
                  backgroundColor: '#07c160',
                  borderRadius: 2,
                  marginRight: 12,
                }}
              />
              <Badge
                text={data?.score}
                style={{
                  padding: '0 3px',
                  backgroundColor: +data?.score > 0.5 ? '#10aeff' : '#ffc300',
                  borderRadius: 2,
                }}
              />
            </>
          }
        </div>
        {baikeImage && (
          <div className="baidu-card__image">
            <img src={`/api/bk?img=${proxyBaikeImage}`} />
          </div>
        )}
        {data?.baike_info?.description && (
          <div className="baidu-card__desc">{data?.baike_info?.description}</div>
        )}
      </div>
    );
  }
})

export default defineComponent({
  name: 'BaiduApi',
  props: ['img'],
  setup(props) {
    const {img = ''} = props
    const formatedImg = img.substr(img.indexOf(',') + 1);

    const countRef = shallowRef(1);
    const count = unref(countRef);

    const { data, loading, error } = useRequest(fetchBaiduSearchRes, {
      defaultParams: img ? [formatedImg, count] : null
    });

    const isError = computed(() =>error.value);
    console.log(isError)

    return () => {
      const result = data.value?.data?.result
      console.log(loading.value, data.value?.data)

      return (
        <Result
          state={
            loading.value || !result?.length
              ? STATE.LOADING
              : isError.value
              ? STATE.ERROR
              : STATE.DONE
          }
          onRetry={() => countRef.value++}
        >
          {!loading.value &&
            !!result?.length &&
            result
              .slice(0, 2)
              .map((v, i) => <BaiduApiPreview data={v} key={i} />)}
          {error.value ? String(error.value) : null}
        </Result>
      ); 
    }
  }
})