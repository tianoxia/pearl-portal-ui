export class LeaderboardReportResponse {
    weelyLeaderboardTotal: WeeklyLeaderboardDetail[];
    leaderboardReportDetails: LeaderboardReportDetail[];
}
export class LeaderboardReportDetail
{
    weeklyLeaderboardDetails: WeeklyLeaderboardDetail[];
    employeeId: number;
    category: string;
    name: string;
    mtdContractGrossMargin: number;
    mtdPermPlacementGrossMargin: number;
    ytdContractGrossMargin: number;
    ytdPermPlacementMargin: number;
    mtdGrossMargin: number;
    ytdGrossMargin: number;
}
export class WeeklyLeaderboardDetail
{
    weekEnding: Date;
    weeklyContractGrossMargin: number;
    weeklyPermPlacementMargin: number;
}
