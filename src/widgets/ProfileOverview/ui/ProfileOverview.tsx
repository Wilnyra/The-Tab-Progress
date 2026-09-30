import { ProfileIdentity } from './ProfileIdentity'
import { ProfileStats } from './ProfileStats'
import { Card, CardContent } from '@/shared/ui/Card'
import { AchievementsSection } from '@/widgets/Achievements'

export const ProfileOverview = (): JSX.Element => (
  <div className="space-y-4">
    <Card variant="section">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <ProfileIdentity />
        <ProfileStats />
      </CardContent>
    </Card>
    <Card variant="section">
      <CardContent className="p-4 sm:p-6">
        <AchievementsSection />
      </CardContent>
    </Card>
  </div>
)
