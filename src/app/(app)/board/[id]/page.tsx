import { BoardClient } from "@/components/sos/board-client";

export default async function HelpBoardItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BoardClient initialId={id} />;
}
