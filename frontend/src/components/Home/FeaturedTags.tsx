"use client";

import { getFeaturedTags } from "frontend/src/services/TagService";
import { Hash } from "lucide-react";
import { useEffect, useState } from "react";

const FeaturedTags = () => {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const fetchTags = async () => {
            const tags = await getFeaturedTags(1, 15);
            setTags(tags);
        }
        fetchTags();
    }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 rounded-2xl mt-10 py-10 px-10">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-lg flex items-center justify-center">
                <Hash className="w-3.5 h-3.5 text-white dark:text-gray-900" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Tags nổi bật
            </h3>
        </div>
        <div className="flex flex-wrap gap-4">
            {tags &&
                tags.map((tag: any) => (
                <div key={tag.tag_id} className="rounded-full p-2 px-4 border border-gray-700 dark:border-gray-700">
                    <p>{tag.tag_name}</p>
                </div>
                ))
            }
        </div>
    </div>
  );
};

export default FeaturedTags;