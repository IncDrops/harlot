import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search polls, users, or tags..." className="pl-10 text-lg h-12 rounded-full shadow-lg" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Start typing to find polls and users.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
