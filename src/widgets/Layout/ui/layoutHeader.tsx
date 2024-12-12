import { appName } from "@/shared/lib/constants"

export const LayoutHeader = () => {
	return (
		<header className="bg-background h-12 rounded-b-xl px-3 flex items-center border border-t-0 shadow">
			<span className="text-foreground">{appName}</span>
		</header>
	)
}
