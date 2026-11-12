import { Icon } from '@parchment/icons/react'
import { type Appearance, Button, Menu, MenuItem, MenuTrigger, Tooltip, TooltipTrigger, useAppearance } from '@parchment/ui'

/** Light, dark, or as the system has it, for the whole tool */
export function AppearanceMenu() {
  const [appearance, setAppearance] = useAppearance()
  return (
    <MenuTrigger>
      <TooltipTrigger>
        <Button variant="ghost" shape="circle" aria-label="Appearance">
          <Icon name={appearance === 'dark' ? 'moon' : appearance === 'light' ? 'sun-max' : 'sun-horizon'} />
        </Button>
        <Tooltip>Appearance</Tooltip>
      </TooltipTrigger>
      <Menu
        placement="bottom end"
        selectionMode="single"
        selectedKeys={[appearance]}
        onSelectionChange={(keys) => {
          const [next] = keys as Set<Appearance>
          if (next) setAppearance(next)
        }}
      >
        <MenuItem id="light">Light</MenuItem>
        <MenuItem id="auto">Auto</MenuItem>
        <MenuItem id="dark">Dark</MenuItem>
      </Menu>
    </MenuTrigger>
  )
}
