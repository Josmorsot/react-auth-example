import { render, screen } from '@testing-library/react'
import { server } from '@/lib/msw/node'
import { ReactNode } from 'react'
import { ApiConfigProvider } from '@/lib/api'
import DownloadButton from '@/lib/downloads/DownloadButton'
import * as matchesDownloaderHook from './useMatchesDownloader'

const useMatchesDownloaderSpy = vi.spyOn(matchesDownloaderHook, 'useMatchesDownloader')
beforeAll(() => { server.listen() })
afterEach(() => { server.resetHandlers() })
afterAll(() => { server.close() })

const Wrapper = (props: { children: ReactNode}) => (
  <ApiConfigProvider baseURL="/api" defaultHeaders={new Headers({ 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDkyOTA0NzIsImV4cCI6NDg2Mjg5MDQ3MiwianRpIjoiYzFjMGVjNTMtMzc1Ny00Y2FjLTk5YTMtZjk3NDAwMTA5ZTFkIiwic3ViIjoiYzBlZDM2YzAtNmM1OS00OGQ0LWExNjgtYjYwNzZjZWM1MmEwIiwidHlwZSI6ImFjY2VzcyJ9.InRoaXMtaXMtbm90LWEtcmVhbC1zaWduYXR1cmUi' }) }>
    {props.children}
  </ApiConfigProvider>
)

describe('<DownloadButton>', () => {
  describe('when status is IDLE', () => {
    beforeAll(() => {
      useMatchesDownloaderSpy.mockReturnValue({ status: matchesDownloaderHook.DownloadStatus.Idle, onDownload: vi.fn(() => Promise.resolve()) })
    })
  
    test('renders button', async () => {
      render(<DownloadButton />, { wrapper: Wrapper })
    
      const button = await screen.findByRole('button', { name: 'Export as CSV' })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })
  
  describe('when status is FAILED', () => {
    beforeAll(() => {
      useMatchesDownloaderSpy.mockReturnValue({ status: matchesDownloaderHook.DownloadStatus.Failed, onDownload: vi.fn(() => Promise.resolve()) })
    })
    
    test('renders button', async () => {
      render(<DownloadButton />, { wrapper: Wrapper })
    
      const button = await screen.findByRole('button', { name: 'Retry' })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })
  
  describe('when status is PENDING', () => {
    beforeAll(() => {
      useMatchesDownloaderSpy.mockReturnValue({ status: matchesDownloaderHook.DownloadStatus.Pending, onDownload: vi.fn(() => Promise.resolve()) })
    })
  
    test('renders button', async () => {
      render(<DownloadButton />, { wrapper: Wrapper })
    
      const button = await screen.findByRole('button', { name: 'Preparing...' })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })
  
  describe('when status is READY', () => {
    beforeAll(() => {
      useMatchesDownloaderSpy.mockReturnValue({ status: matchesDownloaderHook.DownloadStatus.Ready, onDownload: vi.fn(() => Promise.resolve()) })
    })
  
    test('renders button', async () => {
      render(<DownloadButton />, { wrapper: Wrapper })
    
      const button = await screen.findByRole('button', { name: 'Download' })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })
})
