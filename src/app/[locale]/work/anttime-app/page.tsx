import WorkDetailTemplate from "@/components/pages/work/workDetail/WorkDetailTemplate";
import { ANTTIME_APP_CONFIG } from "./_script";

export default function AnttimeApp() {
  return <WorkDetailTemplate config={ANTTIME_APP_CONFIG} />;
}
