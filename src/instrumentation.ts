// Next 서버가 시작될 때 한 번 실행된다(next.config의 experimental.instrumentationHook).
//
// 이 파일은 Node와 Edge(미들웨어) 두 런타임용으로 각각 빌드된다. Node 전용 코드를 여기
// 직접 쓰면 Edge 빌드가 깨지므로, 런타임 조건 안에서 별도 파일을 불러온다. Next가 빌드 시
// NEXT_RUNTIME을 상수로 바꿔 넣어서, Edge 빌드에서는 이 import가 통째로 빠진다.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}
