import { useState } from "react";
import { useApiFetcher } from "../api";
import { Match } from "../api-types";

export enum DownloadStatus {
  Idle = "idle",
  Calculating = "calculating",
  Pending = "pending",
  Ready = "ready",
  Failed = "failed",
}

function useMatchesDownloader() {
  const [data, setData] = useState<Match[]>();
  const [status, setStatus] = useState<DownloadStatus>(DownloadStatus.Idle);
  const fetcher = useApiFetcher();

  const downloadAll = async (page = 0) => {
    let data: Match[];
    const pageSize = 10;
    const res = await fetcher("GET /v1/matches", { page, size: pageSize });
    setStatus(DownloadStatus.Pending);

    if (!res.ok) {
      throw new Error(res.data.message);
    }

    const totalElements = res.headers.get("total");
    const totalPages = totalElements ? Math.ceil(parseInt(totalElements) / pageSize) : 1;
    const hasMorePages = page < totalPages - 1;
    data = res.data;
    if (hasMorePages) {
      const nextPageData = await downloadAll(page + 1);
      data = [...data, ...nextPageData];
    }

    setStatus(DownloadStatus.Ready);
    return data;
  };

  const createFile = (data: Match[]) => {
    const fileName = "matches.json";
    const blob = new Blob([JSON.stringify({ matches: data }, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return {
    status,
    onDownload: async () => {
      try {
        if (status === DownloadStatus.Idle) {
          const data = await downloadAll();
          setData(data);
        } else if (status === DownloadStatus.Ready && data) {
          createFile(data)
        }
      } catch (e) {
        // TODO
      }
    },
  };
}

export default useMatchesDownloader;
