import { StrictMode, type ReactNode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Form } from 'react-aria-components'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  ComboBoxItem,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeading,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Modal,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  TextField,
  Tooltip,
  TooltipTrigger,
} from '../src/index.js'
import './preview.css'

const services = [
  { id: 'identity', name: 'Brand identity' },
  { id: 'website', name: 'Website' },
  { id: 'design-system', name: 'Design system' },
  { id: 'illustration', name: 'Illustration' },
  { id: 'type', name: 'Typeface' },
]

const typefaces = [
  'Atkinson Hyperlegible', 'Bricolage Grotesque', 'Fraunces', 'IBM Plex Sans', 'IBM Plex Serif',
  'Instrument Serif', 'Literata', 'Newsreader', 'Public Sans', 'Source Serif 4', 'Spectral', 'Work Sans',
].map((name) => ({ id: name, name }))

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line pt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-x-10 gap-y-6">{children}</div>
}

function Forms() {
  const [submitted, setSubmitted] = useState<string | null>(null)
  return (
    <Group title="Form fields">
      <Form
        className="grid max-w-xl gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          const data = Object.fromEntries(new FormData(e.currentTarget))
          setSubmitted(`Thanks ${data.name}, that’s sent.`)
        }}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField name="name" label="Name" isRequired />
          <TextField name="email" type="email" label="Email" isRequired description="Only used to reply to you." />
        </div>
        <TextField name="brief" label="What are you working on?" multiline placeholder="A few lines is plenty" />
        <CheckboxGroup name="services" label="What do you need?" defaultValue={['website']}>
          {services.slice(0, 4).map((s) => (
            <Checkbox key={s.id} value={s.id}>{s.name}</Checkbox>
          ))}
        </CheckboxGroup>
        <RadioGroup name="budget" label="Budget" orientation="horizontal" defaultValue="mid">
          <Radio value="small">Under £5k</Radio>
          <Radio value="mid">£5–15k</Radio>
          <Radio value="large">Over £15k</Radio>
          <Radio value="unsure" isDisabled>Not sure yet</Radio>
        </RadioGroup>
        <Switch name="newsletter" defaultSelected>Send me the occasional newsletter</Switch>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Send enquiry</Button>
          <Button type="reset" variant="secondary">Clear</Button>
          {submitted && <p className="text-sm text-muted" role="status">{submitted}</p>}
        </div>
      </Form>

      <Row>
        <TextField label="Invalid" defaultValue="steve@" isInvalid errorMessage="Enter a full email address." />
        <TextField label="Disabled" defaultValue="Parchment" isDisabled />
        <div className="grid gap-1">
          <Checkbox isIndeterminate>Indeterminate</Checkbox>
          <Checkbox isInvalid>Invalid</Checkbox>
          <Checkbox isDisabled defaultSelected>Disabled</Checkbox>
        </div>
        <div className="grid gap-1">
          <Switch>Off</Switch>
          <Switch isDisabled>Disabled</Switch>
        </div>
      </Row>
    </Group>
  )
}

function Selects() {
  return (
    <Group title="Select and combo box">
      <Row>
        <Select label="Service" items={services} placeholder="Choose a service" className="w-64">
          {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
        </Select>
        <ComboBox label="Typeface" defaultItems={typefaces} placeholder="Search typefaces" className="w-64">
          {(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
        </ComboBox>
        <Select label="Disabled" items={services} defaultSelectedKey="website" isDisabled className="w-64">
          {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
        </Select>
      </Row>
    </Group>
  )
}

function Overlays() {
  return (
    <Group title="Overlays">
      <Row>
        <DialogTrigger>
          <Button variant="secondary">Open dialog</Button>
          <Modal>
            <Dialog>
              <DialogHeading>Rename project</DialogHeading>
              <DialogClose />
              <div className="mt-4">
                <TextField label="Name" defaultValue="Loupe" autoFocus />
              </div>
              <DialogFooter>
                <Button slot="close" variant="secondary">Cancel</Button>
                <Button slot="close">Save</Button>
              </DialogFooter>
            </Dialog>
          </Modal>
        </DialogTrigger>

        <DialogTrigger>
          <Button variant="critical">Delete project</Button>
          <Modal isDismissable size="small">
            <Dialog role="alertdialog">
              <DialogHeading>Delete Loupe?</DialogHeading>
              <p className="mt-2 text-sm text-muted">Its files and history go too. This can’t be undone.</p>
              <DialogFooter>
                <Button slot="close" variant="secondary">Cancel</Button>
                <Button slot="close" variant="critical">Delete</Button>
              </DialogFooter>
            </Dialog>
          </Modal>
        </DialogTrigger>

        <DialogTrigger>
          <Button variant="secondary">Popover</Button>
          <Popover showArrow placement="bottom" className="w-64">
            <Dialog>
              <DialogHeading className="text-base">Share link</DialogHeading>
              <p className="mt-1 text-sm text-muted">Anyone with the link can view this project.</p>
            </Dialog>
          </Popover>
        </DialogTrigger>

        <MenuTrigger>
          <Button variant="secondary">Menu</Button>
          <Menu>
            <MenuSection title="Project">
              <MenuItem>Rename</MenuItem>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem isDisabled>Move</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuItem variant="critical">Delete</MenuItem>
          </Menu>
        </MenuTrigger>

        <MenuTrigger>
          <Button variant="secondary">Sort by</Button>
          <Menu selectionMode="single" defaultSelectedKeys={['updated']}>
            <MenuItem id="name">Name</MenuItem>
            <MenuItem id="updated">Last updated</MenuItem>
            <MenuItem id="created">Created</MenuItem>
          </Menu>
        </MenuTrigger>

        <TooltipTrigger delay={300}>
          <Button variant="quiet">Hover for a tooltip</Button>
          <Tooltip>Tooltips show on hover and keyboard focus</Tooltip>
        </TooltipTrigger>
      </Row>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="small">Small</Button>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="quiet">Quiet</Button>
        <Button isDisabled>Disabled</Button>
        <Button isPending>Saving</Button>
      </div>
    </Group>
  )
}

function App() {
  return (
    <main className="mx-auto grid max-w-5xl gap-12 px-[max(16px,env(safe-area-inset-left))] py-10 font-sans">
      <h1 className="text-2xl font-semibold">Parchment components</h1>
      <Forms />
      <Selects />
      <Overlays />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
