import { TStream } from "@/libraries/endpoint/type";
import css from "./card.module.scss";
import CardViewer from "./card-viewer";

interface CardStatusProps {
  isStream: TStream;
  interval: string;
  viewer: number;
}

export default function CardStatus({
  isStream,
  interval,
  viewer,
}: CardStatusProps) {
  return (
    <div className={css.statusBox}>
      {isStream !== "TRUE" ? interval : <CardViewer viewer={viewer} />}
    </div>
  );
}
