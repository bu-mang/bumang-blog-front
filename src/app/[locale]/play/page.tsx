import { PlayItem } from "@/components/pages";
import playItems from "./playItemsData";

export default function Play() {
  return (
    <main className="mx-[6vw] grid grid-cols-1 gap-x-[1.5vw] gap-y-[3vw] sm:grid-cols-2 lg:grid-cols-6">
      {playItems.map((item, index) => {
        if (!item) return <div key={`play-spacer-${index}`} />;

        return (
          <PlayItem
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content}
            imageOnly={item.imageOnly}
            width={item.thumnail.width}
            height={item.thumnail.height}
            imgUrl={item.thumnail.imgUrl}
            items={item.items}
            placeholder={item.thumnail.placeholder}
          />
        );
      })}
    </main>
  );
}
