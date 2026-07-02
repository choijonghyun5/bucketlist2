/* ===== 결제 공통 설정 =====
   Vercel에 API를 배포한 뒤 VERCEL_API_BASE 값을 실제 배포 주소로 교체하세요.
   예) https://bucket-payment-api.vercel.app
   TOSS_CLIENT_KEY는 토스페이먼츠 개발자센터에서 발급받은 "클라이언트 키"
   (시크릿 키 아님, 공개되어도 안전한 값)로 교체하세요.
====================================== */

const VERCEL_API_BASE = "https://YOUR-VERCEL-PROJECT.vercel.app";
const TOSS_CLIENT_KEY = "test_ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const PREMIUM_PRICE = 4900;
const PREMIUM_ORDER_NAME = "버킷리스트 프리미엄";

const PREMIUM_TOKEN_KEY = "bucket_premium_token";
const PREMIUM_LAST_VERIFIED_KEY = "bucket_premium_last_verified";
