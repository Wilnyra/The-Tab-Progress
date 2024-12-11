import { appName } from "@/shared/lib/constants"

export const LayoutHeader = () => {
	return (
		<header className="bg-secondary h-12 rounded-b-2xl px-3 flex items-center">
			<span className="text-foreground">{appName}</span>
		</header>
	)
}
