'use client'

import { useState } from 'react'
import { Search, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const API_URL = 'https://api.similix.in'

interface SearchResult {
  remedyName: string
  confidence: number
  score: number
  source: string
  sources: string[]
  matchingSymptoms: Array<{
    symptom: string
    confidence: number
    source: string
    score: number
  }>
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter symptoms to search')
      return
    }

    setLoading(true)
    setError('')
    setSearchPerformed(true)

    try {
      const response = await fetch(`${API_URL}/symptom/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 10 }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Remedy Finder</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Find homeopathic remedies based on symptoms
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Search for Remedies
            </h2>
            <p className="text-muted-foreground text-lg">
              Describe your symptoms and discover matching homeopathic remedies
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., headache with nausea and sensitivity to light"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 text-base"
              disabled={loading}
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              size="lg"
              className="min-w-24"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {searchPerformed && !loading && (
          <div className="max-w-5xl mx-auto">
            {results.length > 0 ? (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2">
                    Found {results.length} Remedies
                  </h3>
                  <p className="text-muted-foreground">
                    Results ranked by confidence and symptom matching
                  </p>
                </div>

                <div className="grid gap-6">
                  {results.map((result, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl capitalize mb-2">
                              {result.remedyName}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="default">
                                {result.confidence}% Confidence
                              </Badge>
                              <Badge variant="secondary">
                                Score: {(result.score * 100).toFixed(1)}
                              </Badge>
                              <Badge variant="outline">
                                {result.source}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                            Matching Symptoms
                          </h4>
                          <div className="space-y-2">
                            {result.matchingSymptoms.map((symptom, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-muted/50 rounded-lg border"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-sm flex-1">
                                    {symptom.symptom}
                                  </p>
                                  <Badge variant="secondary" className="ml-2">
                                    {symptom.confidence}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Source: {symptom.source}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {result.sources.length > 1 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Available in sources:</span>{' '}
                              {result.sources.join(', ')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try different symptoms or search terms
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Remedy Finder - Homeopathic Remedy Search Demo</p>
          <p className="mt-2">Powered by AI-based symptom matching</p>
        </div>
      </footer>
    </div>
  )
}

