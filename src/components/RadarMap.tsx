import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { GlassCard, CardContent, CardHeader, CardTitle } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { Coordinates } from '@/types/weather'
import { useThemeStore } from '@/stores/themeStore'

interface RainViewerFrame {
  time: number
  path: string
}

interface RainViewerData {
  host: string
  radar: {
    past: RainViewerFrame[]
    nowcast?: RainViewerFrame[]
  }
}

interface RadarMapProps {
  coordinates: Coordinates
}

export function RadarMap({ coordinates }: RadarMapProps) {
  const { theme } = useThemeStore()
  const [apiData, setApiData] = useState<RainViewerData | null>(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Resolve system theme preference
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const baseTileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((data: RainViewerData) => {
        setApiData(data)
        setFrameIndex(data.radar.past.length - 1)
      })
      .catch(console.error)
  }, [])

  const frames = apiData?.radar.past ?? []
  const currentFrame = frames[frameIndex]

  const stepForward = useCallback(() => {
    setFrameIndex((i) => (i + 1) % frames.length)
  }, [frames.length])

  const stepBack = useCallback(() => {
    setFrameIndex((i) => (i - 1 + frames.length) % frames.length)
  }, [frames.length])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(stepForward, 500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, stepForward])

  const formatTime = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <GlassCard blur="lg" gradient interactive className="shadow-glass border border-white/30 dark:border-white/15">
      <CardHeader>
        <CardTitle className="text-white dark:text-gray-100">Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden" style={{ height: 300 }}>
          <MapContainer
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            zoomControl={true}
          >
            <TileLayer
              url={baseTileUrl}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              maxZoom={20}
            />
            {apiData && currentFrame && (
              <TileLayer
                key={currentFrame.path}
                url={`${apiData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={0.7}
                maxNativeZoom={7}
                maxZoom={12}
              />
            )}
          </MapContainer>
        </div>

        {frames.length > 0 && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={stepBack} className="h-8 w-8" aria-label="Previous frame">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying((p) => !p)}
                className="h-8 w-8"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={stepForward} className="h-8 w-8" aria-label="Next frame">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentFrame && formatTime(currentFrame.time)}
              <span className="ml-2 text-xs opacity-60">
                {frameIndex + 1}/{frames.length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}
