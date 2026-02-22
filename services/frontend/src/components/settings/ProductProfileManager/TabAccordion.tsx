/**
 * TabAccordion Component
 * 
 * Draggable accordion for tabs with nested sections.
 */
import React, { useState } from 'react';
import { FaGripVertical, FaChevronDown, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import type { TabConfig, SectionConfig } from '../../../types/dynamicForm';
import {
    AccordionContainer,
    AccordionCard,
    AccordionHeader,
    DragHandle,
    AccordionTitle,
    Badge,
    AccordionActions,
    IconButton,
    ChevronIcon,
    AccordionBody,
    AddItemButton,
    FieldItem,
} from './styled';

interface TabAccordionProps {
    tabs: TabConfig[];
    onReorder: (tabs: TabConfig[]) => void;
    onTabUpdate: (tabId: string, updates: Partial<TabConfig>) => void;
    onSectionUpdate: (tabId: string, sectionId: string, updates: Partial<SectionConfig>) => void;
    onItemSelect: (type: 'tab' | 'section' | 'field', data: any) => void;
}

const TabAccordion: React.FC<TabAccordionProps> = ({
    tabs,
    onReorder,
    onTabUpdate,
    onSectionUpdate,
    onItemSelect,
}) => {
    const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const toggleTab = (tabId: string) => {
        setExpandedTabs(prev => {
            const next = new Set(prev);
            if (next.has(tabId)) {
                next.delete(tabId);
            } else {
                next.add(tabId);
            }
            return next;
        });
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const handleAddTab = () => {
        const newTab: TabConfig = {
            id: `tab-${Date.now()}`,
            name: 'New Tab',
            sections: []
        };
        onReorder([...tabs, newTab]);
    };

    const handleAddSection = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;

        const newSection: SectionConfig = {
            id: `section-${Date.now()}`,
            type: 'fields',
            fields: []
        };

        onTabUpdate(tabId, {
            sections: [...tab.sections, newSection]
        });
    };

    const handleDeleteTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onReorder(tabs.filter(t => t.id !== tabId));
    };

    const handleDeleteSection = (tabId: string, sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        onTabUpdate(tabId, {
            sections: tab.sections.filter(s => s.id !== sectionId)
        });
    };

    const countFields = (section: SectionConfig): number => {
        return section.fields?.length || 0;
    };

    const countSections = (tab: TabConfig): number => {
        return tab.sections.length;
    };

    return (
        <AccordionContainer>
            {tabs.map((tab) => {
                const isTabExpanded = expandedTabs.has(tab.id);

                return (
                    <AccordionCard key={tab.id}>
                        <AccordionHeader onClick={() => toggleTab(tab.id)}>
                            <DragHandle>
                                <FaGripVertical />
                            </DragHandle>
                            <AccordionTitle>{tab.name}</AccordionTitle>
                            <Badge>{countSections(tab)} sections</Badge>
                            <AccordionActions>
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect('tab', tab);
                                }}>
                                    <FaEdit />
                                </IconButton>
                                <IconButton onClick={(e) => handleDeleteTab(tab.id, e)}>
                                    <FaTrash />
                                </IconButton>
                            </AccordionActions>
                            <ChevronIcon $expanded={isTabExpanded}>
                                <FaChevronDown />
                            </ChevronIcon>
                        </AccordionHeader>

                        {isTabExpanded && (
                            <AccordionBody>
                                {tab.sections.map((section) => {
                                    const isSectionExpanded = expandedSections.has(section.id);

                                    return (
                                        <AccordionCard key={section.id} $nested>
                                            <AccordionHeader onClick={() => toggleSection(section.id)}>
                                                <DragHandle>
                                                    <FaGripVertical />
                                                </DragHandle>
                                                <AccordionTitle>
                                                    {section.type === 'custom'
                                                        ? section.customComponent
                                                        : `Section ${section.id}`}
                                                </AccordionTitle>
                                                <Badge>
                                                    {section.type === 'custom'
                                                        ? 'Custom'
                                                        : `${countFields(section)} fields`}
                                                </Badge>
                                                <AccordionActions>
                                                    <IconButton onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect('section', { ...section, tabId: tab.id });
                                                    }}>
                                                        <FaEdit />
                                                    </IconButton>
                                                    <IconButton onClick={(e) => handleDeleteSection(tab.id, section.id, e)}>
                                                        <FaTrash />
                                                    </IconButton>
                                                </AccordionActions>
                                                <ChevronIcon $expanded={isSectionExpanded}>
                                                    <FaChevronDown />
                                                </ChevronIcon>
                                            </AccordionHeader>

                                            {isSectionExpanded && section.type === 'fields' && (
                                                <AccordionBody>
                                                    {section.fields?.map((field, idx) => (
                                                        <FieldItem
                                                            key={field.key || idx}
                                                            onClick={() => onItemSelect('field', {
                                                                ...field,
                                                                tabId: tab.id,
                                                                sectionId: section.id
                                                            })}
                                                        >
                                                            {field.alias || field.name || field.key}
                                                        </FieldItem>
                                                    ))}
                                                    <AddItemButton onClick={() => onItemSelect('field', {
                                                        tabId: tab.id,
                                                        sectionId: section.id,
                                                        isNew: true
                                                    })}>
                                                        <FaPlus /> Add Field
                                                    </AddItemButton>
                                                </AccordionBody>
                                            )}
                                        </AccordionCard>
                                    );
                                })}
                                <AddItemButton onClick={() => handleAddSection(tab.id)}>
                                    <FaPlus /> Add Section
                                </AddItemButton>
                            </AccordionBody>
                        )}
                    </AccordionCard>
                );
            })}
            <AddItemButton onClick={handleAddTab}>
                <FaPlus /> Add Tab
            </AddItemButton>
        </AccordionContainer>
    );
};

export default TabAccordion;
