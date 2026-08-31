import React from 'react';
import LessonDashboardList from '../components/LessonDashboardList';
import LessonViewer from '../components/LessonViewer';

export default function Dashboard({ 
    items, 
    loading, 
    filter, 
    filterKey, 
    selectedItem, 
    setSelectedItem,
    openEditModal,
    deleteItem,
    addItem,
    patchItem,
    addPoints,
    unlockAchievement,
    handleTriggerViewerTour,
    tourForcedCategory,
    setNewLessonCategory,
    setIsAdding
}) {
    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    const filteredItems = items.filter(i => {
        const matchCategory = filter === 'all' ? true : i.category === filter;
        const matchKey = filterKey === 'ALL' ? true : i.harmonica_key === filterKey;
        return matchCategory && matchKey;
    });

    return (
        <div className="p-6">
            {selectedItem ? (
                <LessonViewer
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    filteredItems={filteredItems}
                    items={items}
                    openEditModal={openEditModal}
                    deleteItem={deleteItem}
                    addItem={addItem}
                    patchItem={patchItem}
                    addPoints={addPoints}
                    unlockAchievement={unlockAchievement}
                    onShowTour={handleTriggerViewerTour}
                />
            ) : (
                <LessonDashboardList 
                    items={filteredItems} 
                    setSelectedItem={setSelectedItem} 
                    patchItem={patchItem} 
                    forcedOpenCategory={tourForcedCategory}
                    onAddLesson={(catId) => {
                        setNewLessonCategory(catId);
                        setIsAdding(true);
                    }}
                />
            )}
        </div>
    );
}
