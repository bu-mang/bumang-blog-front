import sharp from "sharp";

// libvips(sharp의 이미지 처리 엔진)의 메모리 캐시를 끈다.
//
// 기본값은 최근 작업 결과를 최대 50MB까지 들고 있는데, 이 블로그에서는 맞을 일이 거의
// 없다. Next 이미지 최적화는 요청마다 원본을 새 버퍼로 넘기고, 같은 요청의 반복은
// Next의 디스크 캐시와 Cloudflare가 이미 막는다. 반면 이 캐시는 V8 힙 바깥이라 GC로
// 비워지지 않고 컨테이너 한도(256MB)를 그대로 차지한다.
//
// Next의 이미지 최적화와 업로드 압축(utils/compressImage/server.ts)이 같은 sharp를
// 쓰므로 여기서 한 번 끄면 둘 다에 적용된다.
sharp.cache(false);
console.info("[startup] sharp(libvips) 메모리 캐시 꺼짐");
