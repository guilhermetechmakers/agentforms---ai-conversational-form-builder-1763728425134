import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save, Eye, Settings } from "lucide-react"
import type { Field } from "@/types"

export function AgentBuilderPage() {
  const [agentName, setAgentName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<Field[]>([])

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      key: `field_${fields.length + 1}`,
      type: "text",
      label: "",
      required: false,
      order: fields.length,
    }
    setFields([...fields, newField])
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="flex h-screen">
        {/* Left Sidebar - Field List */}
        <aside className="w-80 border-r border-border bg-background-secondary p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Fields</h2>
            <Button onClick={addField} className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <Card
                key={field.id}
                className="p-3 cursor-pointer hover:bg-background-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {field.label || `Field ${index + 1}`}
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    {field.type}
                  </span>
                </div>
              </Card>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-foreground-secondary text-center py-8">
                No fields yet. Add your first field to get started.
              </p>
            )}
          </div>
        </aside>

        {/* Main Content - Field Editor */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>
                  Configure your agent's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Agent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this agent do?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Field Editor */}
            {fields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Field Configuration</CardTitle>
                  <CardDescription>
                    Configure the selected field's properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-secondary">
                    Select a field from the sidebar to edit
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Persona & Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Persona & Tone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-secondary">
                    Configure how your agent communicates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-secondary">
                    Customize colors, logo, and branding
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Preview */}
        <aside className="w-96 border-l border-border bg-background-secondary p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <Card className="h-[600px]">
            <CardContent className="p-6">
              <p className="text-sm text-foreground-secondary text-center py-12">
                Preview will appear here
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background-secondary px-6 py-4">
        <div className="flex items-center justify-between max-w-full">
          <div className="text-sm text-foreground-secondary">
            Last saved: Just now
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button>
              Publish Agent
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
