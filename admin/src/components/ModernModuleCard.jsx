import React, { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Star, Play, BookOpen, Target, Shield, Zap } from "lucide-react";
import { it } from "zod/v4/locales";

const ModernModuleCard = ({ module, viewMode = "grid" }) => {
  // Get category icon and color
  const getCategoryConfig = (category) => {
    switch (category) {
      case "Offensive":
        return {
          icon: Zap,
          color: "text-red-700",
          bgColor: "bg-red-100",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
        };
      case "Defensive":
        return {
          icon: Shield,
          color: "text-blue-700",
          bgColor: "bg-blue-100",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        };
      default:
        return {
          icon: Target,
          color: "text-green-700",
          bgColor: "bg-green-100",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
        };
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Fundamental":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Easy":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Hard":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // const categoryConfig = getCategoryConfig(module.category);
  // const CategoryIcon = categoryConfig.icon;

  // if (viewMode === "list") {
  //   return (
  //     <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
  //       <CardContent className="p-4 sm:p-6">
  //         <div className="flex flex-col sm:flex-row gap-4">
  //           {/* Image */}
  //           <div className="relative w-full sm:w-48 h-32 sm:h-24 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
  //             <div
  //               className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
  //               style={{
  //                 backgroundImage: `url(${
  //                   module.image || "/module-images/default.jpg"
  //                 })`,
  //                 filter: "brightness(0.9)",
  //               }}
  //             />
  //             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

  //             {/* Badges on image */}
  //             <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
  //               <div
  //                 className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color} backdrop-blur-sm`}
  //               >
  //                 <CategoryIcon className="w-3 h-3" />
  //                 <span>{module.category}</span>
  //               </div>
  //               <Badge
  //                 className={`text-xs font-semibold ${getDifficultyColor(
  //                   module.difficulty
  //                 )}`}
  //               >
  //                 {module.difficulty}
  //               </Badge>
  //             </div>
  //           </div>

  //           {/* Content */}
  //           <div className="flex-1 min-w-0">
  //             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
  //               <div className="flex-1 min-w-0 text-left">
  //                 <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
  //                   {module.title}
  //                 </CardTitle>
  //                 <CardDescription className="text-sm text-gray-600 line-clamp-2">
  //                   {module.description}
  //                 </CardDescription>
  //               </div>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 className="text-gray-400 hover:text-yellow-500 flex-shrink-0"
  //               >
  //                 <Star className="w-4 h-4" />
  //               </Button>
  //             </div>

  //             {/* Meta info and actions */}
  //             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
  //               <div className="flex items-center gap-4 text-sm text-gray-600">
  //                 <div className="flex items-center gap-1">
  //                   <Clock className="w-4 h-4" />
  //                   <span>{module.estimatedTime}</span>
  //                 </div>
  //                 <div className="flex items-center gap-1">
  //                   <BookOpen className="w-4 h-4" />
  //                   <span>{module.progress}% Complete</span>
  //                 </div>
  //               </div>

  //               <div className="flex items-center gap-2">
  //                 {/* Tags */}
  //                 <div className="flex gap-1">
  //                   {module.tags.slice(0, 2).map((tag, index) => (
  //                     <Badge
  //                       key={index}
  //                       variant="secondary"
  //                       className="text-xs bg-gray-100 text-gray-700"
  //                     >
  //                       {tag}
  //                     </Badge>
  //                   ))}
  //                 </div>

  //                 <Button
  //                   size="sm"
  //                   className="bg-blue-600 hover:bg-blue-700 text-white"
  //                 >
  //                   <Play className="w-3 h-3 mr-1" />
  //                   {module.progress > 0 ? "Continue" : "Start"}
  //                 </Button>
  //               </div>
  //             </div>

  //             {/* Progress bar */}
  //             {module.progress > 0 && (
  //               <div className="mt-3">
  //                 <Progress
  //                   value={module.progress}
  //                   className="h-2 bg-gray-200"
  //                 />
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <>
      {module &&
        module.map((item, idx) => (
          <Card
            key={idx}
            className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 bg-white flex flex-col h-full"
          >
            {/* Header with image and overlay */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100 flex-shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${
                    item.image || "/module-images/default.jpg"
                  })`,
                  filter: "brightness(0.85)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Difficulty badge */}
              <div className="absolute top-3 right-3">
                <Badge
                  className={`text-xs font-semibold shadow-sm ${getDifficultyColor(
                    item.complexity
                  )}`}
                >
                  {item.complexity}
                </Badge>
              </div>

              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <div
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium
                    
                      backdrop-blur-sm shadow-sm`}
                >
                  {/* <CategoryIcon className="w-3.5 h-3.5" /> */}
                  <span className="text-center">{item.type}</span>
                </div>
              </div>

              {/* Progress overlay */}
              {/* {module.progress > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
              <Progress value={module.progress} className="h-1.5 bg-white/30" />
            </div>
          </div>
        )} */}
            </div>

            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 text-left">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-3">
                    {item.detail}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-yellow-500 flex-shrink-0"
                >
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col flex-1">
              {/* Meta information */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{item.hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {/* <span>{module.progress}% Complete</span> */}
                </div>
              </div>

              {/* Tags - flexible content area */}
              <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
                {item.tag.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors h-fit"
                  >
                    {tag}
                  </Badge>
                ))}
                {item.tag.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500 border-gray-300 h-fit"
                  >
                    +{item.tag.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Action buttons - always at bottom */}
              <div className="flex gap-2 mt-auto">
                {/* <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors justify-center">
            <Play className="w-4 h-4 mr-2" />
            {module.progress > 0 ? 'Continue' : 'Start Module'}
          </Button> */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 justify-center"
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </>
  );
};

export default ModernModuleCard;
