import { Button } from "@mui/material"
import useMatchesDownloader, { DownloadStatus } from "./useMatchesDownloader"

const DownloadMessage = {
  [DownloadStatus.Idle]: 'Export as CSV',
  [DownloadStatus.Pending]: 'Preparing...',
  [DownloadStatus.Ready]: 'Download',
  [DownloadStatus.Failed]: 'Retry'
}
function DownloadButton() {
  const { status, onDownload } = useMatchesDownloader()
  const handleDownload = () => {
    onDownload().catch(() => {
      // Do nothing
    })
  }
  return (
    <Button onClick={handleDownload} disabled={status === DownloadStatus.Pending}>
      {DownloadMessage[status]}
    </Button>
  )
}

export default DownloadButton
