import { useState } from "react";
import { useApiFetcher } from "../api";
import { Match } from "../api-types";
import { downloadAsCsv } from "../api/utils";

export enum DownloadStatus {
  Idle = "idle",
  Pending = "pending",
  Ready = "ready",
  Failed = "failed",
}

const simplifyMatch = (match: Match) => {
  const {startDate, endDate, ...otherMatchesProps} = match
  return {
    ...otherMatchesProps,
    date: new Date(startDate.replace('Z','')).toLocaleDateString(),
    start: new Date(startDate.replace('Z','')).toLocaleTimeString(),
    end: new Date(endDate.replace('Z','')).toLocaleTimeString(),
    teams: match.teams.map(team => {
      return team.players.map(p => p.email)
    })
  }
}

export function useMatchesDownloader() {
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

  return {
    status,
    onDownload: async () => {
      try {
        if (status === DownloadStatus.Idle) {
          const data = await downloadAll();
          setData(data);
        } else if (status === DownloadStatus.Ready && data) {
          downloadAsCsv(data.map(simplifyMatch))
        }
      } catch (e) {
        setStatus(DownloadStatus.Failed)
      }
    },
  };
}
