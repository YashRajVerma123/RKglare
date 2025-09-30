
import { db } from '@/lib/firebase-server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Author, authorConverter } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLevel, levels } from '@/lib/gamification';
import { Crown, Medal, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


async function getTopUsers(count: number = 50): Promise<Author[]> {
    const usersCollection = collection(db, 'users').withConverter(authorConverter);
    const q = query(usersCollection, orderBy('points', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
};

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
}

const LeaderboardPage = async () => {
  const topUsers = await getTopUsers();

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Top Readers<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Recognizing the most engaged and dedicated members of the Glare community.
        </p>
      </section>
      
      {topUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {topUsers.slice(0, 3).map((user, index) => (
                  <div key={user.id} className={cn(
                      "glass-card p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 relative overflow-hidden",
                      index === 0 && "aurora-border",
                  )}>
                       <div className="absolute -top-4 -right-4 h-16 w-16 bg-primary/5 rounded-full blur-lg"></div>
                      <div className="mb-4">
                          {index === 0 && <Crown className="h-10 w-10 text-yellow-400" />}
                          {index === 1 && <Medal className="h-10 w-10 text-slate-400" />}
                          {index === 2 && <Trophy className="h-10 w-10 text-orange-500" />}
                      </div>
                      <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-headline font-semibold">{user.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 mb-2">
                         {getLevel(user.points || 0).name}
                      </div>
                      <div className="text-2xl font-bold font-mono text-primary">
                          {(user.points || 0).toLocaleString()} PTS
                      </div>
                  </div>
              ))}
          </div>
      )}

      <div className="glass-card">
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Points</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {topUsers.map((user, index) => {
                    const level = getLevel(user.points || 0);
                    return (
                        <TableRow key={user.id} className={cn(index < 3 && "font-bold")}>
                            <TableCell className="text-center">
                               <div className="h-full flex items-center justify-center">
                                    <RankIcon rank={index + 1} />
                               </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <level.icon className="h-5 w-5" style={{ color: level.color }} />
                                    <span>{level.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-lg">{(user.points || 0).toLocaleString()}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
