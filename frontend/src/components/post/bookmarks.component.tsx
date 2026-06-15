import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExploreViewListComponent from "./post.view.list.component";
import { Post } from "../../models/post";
import { useGetMyBookmarksQuery } from "../../redux/apis/bookmark.api";
import PaginationComponent from "../pagination/pagination.component";
import { getSessionBookmarks } from "../../utils/session-bookmarks";
import StoryTradingCard from "../cards/StoryTradingCard";
import { IStories } from "../stories/stories.view.component";

const BookmarksComponent = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [size, setSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("newest");

  const query: Record<string, string | number> = {
    page,
    limit: size,
  };

  const { data, isLoading } = useGetMyBookmarksQuery({ ...query });

  const onPaginationChange = (pageNumber: number, pageSize: number) => {
    setPage(pageNumber);
    setSize(pageSize);
  };

  const allPosts: Post[] = (data?.posts ?? []) as Post[];

  const [activeTab, setActiveTab] = useState<"posts" | "generated">("posts");
  const [sessionStories, setSessionStories] = useState<IStories[]>(() => getSessionBookmarks());

  useEffect(() => {
    const handleBookmarkChange = () => {
      setSessionStories(getSessionBookmarks());
    };
    window.addEventListener("session_bookmarks_changed", handleBookmarkChange);
    return () => {
      window.removeEventListener("session_bookmarks_changed", handleBookmarkChange);
    };
  }, []);

  const filteredSessionStories = sessionStories.filter(
    (story: IStories) =>
      story &&
      ((story.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (story.tag?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (story.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
  );

  // Implement client-side instant search for bookmarks
  const filteredPosts = allPosts.filter(
    (story: Post) =>
      story &&
      ((story.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (story.tag?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (story.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
  );

  // Sort posts client-side
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "title-asc":
        return (a.title || "").localeCompare(b.title || "");
      case "title-desc":
        return (b.title || "").localeCompare(a.title || "");
      case "length-asc":
        return (a.content || "").length - (b.content || "").length;
      case "length-desc":
        return (b.content || "").length - (a.content || "").length;
      case "newest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b1329] dark:text-white relative overflow-hidden pb-12">
      {/* Background blobs for premium aesthetic */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-100/30 dark:bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-100/30 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-full transition-all duration-300 shadow-sm border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer">
                <i className="fa-solid fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
                Return Home
              </button>
            </Link>
          </div>

          <div className="w-full md:w-80 lg:w-96 relative">
            <input
              type="text"
              placeholder="Search saved stories..."
              className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 text-sm"></i>
          </div>
        </div>

        {/* Page Title & Stats */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight dark:text-white">
              <span className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-500/30">
                <i className="fas fa-bookmark text-lg"></i>
              </span>
              My Collection
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">
              Stories and drafts you've saved for later inspiration
            </p>
          </div>

          {/* Controls Bar (Visible only for Published Stories when there are posts) */}
          {activeTab === "posts" && allPosts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-gray-400">Sort By</span>
                <select
                  className="rounded-xl border border-slate-200 text-xs bg-white text-slate-700 py-1.5 px-2.5 outline-none transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title-asc">A-Z</option>
                  <option value="title-desc">Z-A</option>
                  <option value="length-asc">Shortest</option>
                  <option value="length-desc">Longest</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-gray-400">Show</span>
                <select
                  className="rounded-xl border border-slate-200 text-xs bg-white text-slate-700 py-1.5 px-2.5 outline-none transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "posts"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Published Stories ({allPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("generated")}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "generated"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Generated Drafts ({sessionStories.length})
          </button>
        </div>

        {/* Content Render Area */}
        <div className="min-h-[50vh]">
          {activeTab === "posts" ? (
            !isLoading && allPosts.length === 0 ? (
              /* Published Stories Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xl backdrop-blur-md dark:bg-slate-900/60 dark:border-slate-800 dark:text-white">
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/10 shadow-inner">
                  <i className="far fa-bookmark text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-2 dark:text-slate-200">
                  Your collection is waiting
                </h3>
                <p className="text-slate-500 max-w-sm mb-8 text-sm sm:text-base leading-relaxed dark:text-gray-400">
                  Whenever you find a story that moves you, save it here to build your personal library of inspiration.
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className="cursor-pointer rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 shadow-md hover:-translate-y-0.5 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Explore Stories
                </button>
              </div>
            ) : (
              <ExploreViewListComponent
                posts={sortedPosts}
                isLoading={isLoading}
              />
            )
          ) : (
            sessionStories.length === 0 ? (
              /* Generated Drafts Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xl backdrop-blur-md dark:bg-slate-900/60 dark:border-slate-800 dark:text-white">
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/10 shadow-inner">
                  <i className="far fa-bookmark text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-2 dark:text-slate-200">
                  No saved drafts yet
                </h3>
                <p className="text-slate-500 max-w-sm mb-8 text-sm sm:text-base leading-relaxed dark:text-gray-400">
                  Generate stories and bookmark them to build a collection of your favorite drafts for this session.
                </p>
                <button
                  onClick={() => navigate("/stories")}
                  className="cursor-pointer rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 shadow-md hover:-translate-y-0.5 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Create a Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredSessionStories.map((story) => (
                  <StoryTradingCard key={story.uuid} story={story} />
                ))}
              </div>
            )
          )}
        </div>

        {/* Pagination bar */}
        {activeTab === "posts" && allPosts.length > 0 && data?.meta && (
          <div className="mt-12 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-850 rounded-2xl py-4 px-6 shadow-md">
            <PaginationComponent
              current={page}
              pageSize={size}
              total={data.meta.total}
              onChange={onPaginationChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksComponent;
