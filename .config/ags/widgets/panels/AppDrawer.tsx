import { Gtk } from "ags/gtk4"
import { For, createBinding } from "ags"
import AstalApps from "gi://AstalApps"
import { execAsync } from "ags/process"
import Pango from "gi://Pango";

interface AppDrawerProps {
	searchEntry: Accessor<Gtk.SearchEntry> | Gtk.SearchEntry
	setSearchEntry: Setter<Gtk.SearchEntry> | Gtk.SearchEntry
}

export default function AppDrawer({ searchEntry, setSearchEntry }: AppDrawerProps) {
  // Initialise list of available apps
  const apps = new AstalApps.Apps()
  const appList = createBinding(apps, "list")
  let appsMapped: string[] = []

  // Initialise search
  let search = ""
  let listBox = new Gtk.ListBox()
  let rowCount = 0

  // Search filter
  function searchFilter(row: Gtk.ListBoxRow) {
	const Application = row.child.Application
	if (search && rowCount < 8) {
		const fuzzyScore = apps.fuzzy_score(search, Application)
		if (fuzzyScore >= 0.9) {
			rowCount += 1
			return true
		} else {
			return false
		}
	} else {
		return false
	}
  }

  function searchSort(row1: Gtk.ListBoxRow, row2: Gtk.ListBowRow) {
	const Application1 = row1.child.Application
	const Application2 = row2.child.Application
	if (search) {
		const fuzzyScore1 = apps.fuzzy_score(search, Application1)
		const fuzzyScore2 = apps.fuzzy_score(search, Application2)
		return (fuzzyScore2 - fuzzyScore1)
	} else {
		return 0
	}
  }

  return (
	<box
		class="AppDrawer"
		orientation={Gtk.Orientation.VERTICAL}
		spacing={20}
		halign={Gtk.Align.CENTER}
	>
		<label
			class="DrawerTitle"
			label=""
			halign={Gtk.Align.CENTER}
		/>
		<Gtk.SearchEntry
			onSearchChanged={(self) => {
				search = self.get_text().trim()
				rowCount = 0
				listBox.invalidate_sort()
				listBox.invalidate_filter()
				listBox.select_row(listBox.get_row_at_index(0))
			}}
			onActivate={(self) => {
				listBox.get_selected_row().get_first_child().activate()
				self.set_text("")
				}}
			onMap={(self) => {setSearchEntry(self)}}
		/>
		<Gtk.ListBox
			selectionMode={Gtk.SelectionMode.BROWSE}
			onRowActivated={(self, row) => {
				console.log(`Row activated`)
				row.child.activate()

			}}
			$={(self) => {
				listBox = self
				self.set_filter_func(searchFilter)
				self.set_sort_func(searchSort)
			}}
		>
				<For each={appList((list) => list.filter((app) => !(appsMapped.includes(app.name))))}>
					{(anApp) => {
						appsMapped.push(anApp.name)
						return (
						<button
							onClicked={() => {
								const desktopExec = anApp.executable
								const args = desktopExec.split(" ")
								const exec = args[0]
								execAsync(`uwsm app -- ${exec}`)
							}}
							canFocus={false}
							$={(self) => {
								self.Application = anApp
							}}
						>
							<box>
								<image iconName={anApp.iconName} />
								<label label={anApp.name} maxWidthChars={40} wrap />
							</box>
						</button>
					)}}
				</For>
		</Gtk.ListBox>
		<Gtk.FlowBox
			class="AppGrid"
			orientation={Gtk.Orientation.HORIZONTAL}
			rowSpacing={10}
			columnSpacing={10}
			homogeneous={true}
			maxChildrenPerLine={20}
			onSelectedChildrenChanged={(self) => {
				self.get_selected_children()[0].child.grab_focus()
			}}
		>
			<For each={appList}>
				{(anApp) => (
					<button onClicked={() => {
							const desktopExec = anApp.executable
							const args = desktopExec.split(" ")
							const exec = args[0]
							execAsync(`uwsm app -- ${exec}`)
						}}
						halign={Gtk.Align.START}
					>
						<box
							orientation={Gtk.Orientation.VERTICAL}
						>
								<image
									class="AppIcon"
									iconName={anApp.iconName}
									pixelSize={120}
								/>
								<label
									class="AppLabel"
									label={anApp.name}
									maxWidthChars={10}
									wrap
									justify={Gtk.Justification.CENTER}
									lines={2}
									ellipsize={Pango.EllipsizeMode.END}
								/>
						</box>
					</button>
				)}
			</For>
		</Gtk.FlowBox>
	</box>
  )
}
